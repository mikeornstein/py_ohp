module SimulationRunner

using OscillatingHeatPipe
using Dates

export run_simulation

# Define the forcing models
function heatermodel!(σ,T,t,fr::AreaRegionCache,phys_params)
    σ .= phys_params["areaheater_power"] / phys_params["areaheater_area"] / phys_params["flux_correction"]
end

function condensermodel!(σ,T,t,fr::AreaRegionCache,phys_params)
    T0 = phys_params["areaheater_temp"]
    h = phys_params["areaheater_coeff"]
    corr = phys_params["flux_correction"]
    σ .= h*(T0 - T) / corr
end

function ohpmodel!(σ,T,t,fr::LineRegionCache,phys_params)
    σ .= phys_params["ohp_flux"] ./ phys_params["flux_correction"]
end

function get_qbplus(t,x,base_cache,phys_params,motions)
    nrm = normals(base_cache)
    qbplus = zeros_surface(base_cache)
    return qbplus
end

function get_qbminus(t,x,base_cache,phys_params,motions)
    nrm = normals(base_cache)
    qbminus = zeros_surface(base_cache)
    return qbminus
end

function run_simulation(config::Dict)
    # Default Physical Parameters
    ρₛ = 2730; # material density [kg/m^3]
    cₛ = 8.93e02; # material specific heat [J/kg K]
    kₛ = 1.93e02; # material heat conductivity [W/m K]
    plate_d = 1.5e-3; # effective d [m]
    αₛ = kₛ/ρₛ/cₛ
    Tref = 291.2 # reference temperature [K]

    # Map overrides from Config
    power = get(config, "power", 70.0)
    Lheater_x = get(config, "heater_size", 50e-3)
    Lheater_y = get(config, "heater_size", 50e-3)
    areaheater_area = Lheater_x * Lheater_y
    fluid_type = get(config, "fluid_type", "Butane")
    
    phys_params = Dict(
        "diffusivity" => αₛ,
        "flux_correction" => ρₛ*cₛ*plate_d,
        "Fourier" => 1.0,
        "ohp_flux" => [NaN],
        "areaheater_power" => power,
        "areaheater_area" => areaheater_area,
        "areaheater_temp" => 0.0,
        "areaheater_coeff" => 4000.0,
        "background temperature" => Tref
    )

    p_fluid = SaturationFluidProperty(fluid_type, Tref)

    # Geometry Setup
    Δx = 0.0007
    Lx = get(config, "Lx", 6 * INCHES * 1.02)
    Ly = get(config, "Ly", 2 * INCHES * 1.05)
    xlim = (-Lx/2, Lx/2)
    ylim = (-Ly/2, Ly/2)
    g = PhysicalGrid(1.03 .* xlim, 1.1 .* ylim, Δx)
    
    xbound = [-Lx/2, -Lx/2, Lx/2, Lx/2]
    ybound = [ Ly/2, -Ly/2, -Ly/2, Ly/2]
    Δs = 1.4*cellsize(g)
    body = Polygon(xbound,ybound,Δs)

    X = MotionTransform([0,0],0)
    joint = Joint(X)
    m = RigidBodyMotion(joint,body)
    x = zero_motion_state(body,m)
    update_body!(body,x,m)

    bcdict = Dict("exterior" => get_qbplus,"interior" => get_qbminus)

    # Evaporator & Condenser Shape setup
    eb1 = Rectangle(Lheater_x/2, Lheater_x/2, 1.4*Δx)
    tr1_h = RigidTransform((0.0, -0.0), 0.0)
    heater1 = AreaForcingModel(eb1, tr1_h, heatermodel!)

    Lcondenser_x = get(config, "condenser_size_x", 15e-3)
    Lcondenser_y = get(config, "condenser_size_y", 1.0 * INCHES)
    cb1 = Rectangle(Lcondenser_x, Lcondenser_y, 1.4*Δx)
    tr1_c = RigidTransform((2.4 * INCHES, -0.0), 0.0)
    cond1 = AreaForcingModel(cb1, tr1_c, condensermodel!)

    # OHP Curve
    ds = 1.5*Δx
    nturn = get(config, "turns", 9)
    width_ohp = 46.25*1e-3
    length_ohp = 147.0*1e-3
    gap = 3e-3
    pitch = width_ohp/(2*nturn+1)
    rotation_angle = 3π/2
    x0, y0 = length_ohp/2 + 2e-3, width_ohp/2
    ohp_x, ohp_y, xf, yf = construct_ohp_curve(nturn, pitch, length_ohp, gap, ds, x0, y0, false, false, rotation_angle)

    ohb = BasicBody(ohp_x, ohp_y)
    tr_ohp = RigidTransform((0.0,0.0),0.0)
    ohp_linesource = LineForcingModel(ohb, tr_ohp, ohpmodel!)

    forcing_dict = Dict("heating models" => [heater1, cond1, ohp_linesource])

    # Build Systems
    tstep = get(config, "tstep", 1e-3)
    timestep_fixed(u, sys) = tstep

    prob = NeumannHeatConductionProblem(g, body, phys_params=phys_params, 
                                        bc=bcdict, motions=m, 
                                        forcing=forcing_dict, 
                                        timestep_func=timestep_fixed)
    sys_plate = construct_system(prob)
    sys_tube = initialize_ohpsys(sys_plate, p_fluid, power)

    # Integrator Initialization
    tspan_init = (0.0, 1e4)
    u_plate = init_sol(sys_plate)
    integrator_plate = init(u_plate, tspan_init, sys_plate, save_on=false)

    tspan_arr = get(config, "tspan", [0.0, 1.0])
    tspan = (Float64(tspan_arr[1]), Float64(tspan_arr[2]))
    dt_record = get(config, "dt_record", 0.2)
    
    u_tube = newstate(sys_tube)
    integrator_tube = init(u_tube, tspan, sys_tube)

    SimuResult = SimulationResult(integrator_tube, integrator_plate)

    # Main Loop
    for t in tspan[1]:tstep:tspan[2]
        timemarching!(integrator_tube, integrator_plate, tstep)
        if (mod(integrator_plate.t, dt_record) < 1e-6) || (mod(-integrator_plate.t, dt_record) < 1e-6)
            store!(SimuResult, integrator_tube, integrator_plate)
        end
    end

    # Return Result
    # In reality, we'd save this to JLD2. For headless execution, we return a temp file path or dict.
    output_dir = abspath(joinpath(@__DIR__, "output"))
    mkpath(output_dir)
    filename = joinpath(output_dir, "sim_result_$(Dates.format(now(), "yyyymmdd_HHMMSS")).txt")
    
    # Just write a dummy status file for the test
    open(filename, "w") do io
        write(io, "Simulation Complete. Steps: $(length(SimuResult.tube_hist_t))")
    end

    return filename
end

end
