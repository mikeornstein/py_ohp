using Test
using JSON3
using HTTP
using WebBackend

# Helper to start/stop the server for integration testing
# We need to include the server logic here because the Server module 
# in src/WebBackend.jl was recently refactored to be a standalone script 
# for proper route registration.
include("../server.jl")

@testset "WebBackend Tests" begin

    @testset "Headless Scripting & Simulation" begin
        config = Dict(
            "fluid_type" => "Butane",
            "power" => 70.0,
            "tstep" => 1e-3,
            "tspan" => [0.0, 0.01], # Extremely short for testing
            "dt_record" => 0.005,
            "Lx" => 0.155,
            "Ly" => 0.053,
            "heater_size" => 0.05,
            "condenser_size_x" => 0.015,
            "condenser_size_y" => 0.0254,
            "turns" => 9
        )
        
        result_path = run_simulation(config)
        @test ispath(result_path)
        
        # Verify the output file has content
        content = read(result_path, String)
        @test occursin("Simulation Complete", content)
    end

    @testset "API Integration Tests" begin
        # Start server on a test port
        test_port = 8081
        test_url = "http://localhost:$test_port"
        
        # Run the server in a separate task
        # We use a custom start because server.jl calls serve() which is blocking
        start_server(host="0.0.0.0", port=test_port, async=true)
        
        # Wait for server to be ready
        retries = 5
        while retries > 0
            try
                res = HTTP.get("$test_url/health")
                if res.status == 200
                    break
                end
            catch
                sleep(1)
            end
            retries -= 1
        end
        
        @testset "GET /health" begin
            res = HTTP.get("$test_url/health")
            @test res.status == 200
            data = JSON3.read(res.body)
            @test data.status == "ok"
        end
        
        @testset "POST /api/simulate & Polling" begin
            config = Dict(
                "fluid_type" => "Butane",
                "power" => 70.0,
                "tstep" => 1e-3,
                "tspan" => [0.0, 0.01],
                "dt_record" => 0.005,
                "Lx" => 0.155,
                "Ly" => 0.053,
                "heater_size" => 0.05,
                "condenser_size_x" => 0.015,
                "condenser_size_y" => 0.0254,
                "turns" => 9
            )
            
            # Submit job
            res = HTTP.post("$test_url/api/simulate", 
                            ["Content-Type" => "application/json"], 
                            JSON3.write(config))
            @test res.status == 200
            data = JSON3.read(res.body)
            @test haskey(data, :job_id)
            job_id = data.job_id
            
            # Poll status until completed
            max_polls = 30
            status_data = nothing
            while max_polls > 0
                res = HTTP.get("$test_url/api/status/$job_id")
                @test res.status == 200
                status_data = JSON3.read(res.body)
                if status_data.status == "completed"
                    break
                elseif status_data.status == "failed"
                    error("Simulation job failed: $(status_data.error)")
                end
                sleep(2)
                max_polls -= 1
            end
            
            @test status_data.status == "completed"
            @test haskey(status_data, :result)
            @test ispath(status_data.result)
        end
        
        # Shutdown server
        terminate()
    end

end
