# Entry point to start the OHP Web Backend server
# Usage: ~/.juliaup/bin/julia --project=web_backend web_backend/server.jl

using Oxygen
using HTTP
using JSON3
using UUIDs

# Load the simulation runner
include("src/simulation_runner.jl")
using .SimulationRunner

# In-memory job state tracker
const JOBS = Dict{String, Dict{String, Any}}()

# --- Routes ---

@get "/health" function(req::HTTP.Request)
    return Dict("status" => "ok")
end

@post "/api/simulate" function(req::HTTP.Request)
    config = JSON3.read(String(req.body), Dict)

    job_id = string(uuid4())

    JOBS[job_id] = Dict(
        "status" => "running",
        "progress" => 0.0,
        "result" => nothing,
        "error" => nothing
    )

    Threads.@spawn begin
        try
            result_path = run_simulation(config)
            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["progress"] = 100.0
            JOBS[job_id]["result"] = result_path
        catch e
            @error "Job $job_id failed" exception=(e, catch_backtrace())
            JOBS[job_id]["status"] = "failed"
            JOBS[job_id]["error"] = string(e)
        end
    end

    return Dict("job_id" => job_id, "status" => "accepted")
end

@get "/api/status/{job_id}" function(req::HTTP.Request, job_id::String)
    if haskey(JOBS, job_id)
        return JOBS[job_id]
    else
        return HTTP.Response(404, "Job ID not found")
    end
end

# --- Start Functions ---

function start_server(; host="0.0.0.0", port=8080, async=false)
    println("Starting OHP Web Backend on http://$host:$port")
    serve(host=host, port=port, async=async)
end

if abspath(PROGRAM_FILE) == @__FILE__
    start_server()
end
