module Server

using Oxygen
using HTTP
using JSON3
using UUIDs
using WebBackend.SimulationRunner

export start_server

# In-memory job state tracker
# Production should use Redis or a DB, but this works for development
const JOBS = Dict{String, Dict{String, Any}}()

@get "/health" function(req::HTTP.Request)
    return Dict("status" => "ok")
end

@post "/api/simulate" function(req::HTTP.Request)
    # Parse the incoming JSON config
    config = JSON3.read(req.body, Dict)
    
    # Generate a unique Job ID
    job_id = string(uuid4())
    
    # Initialize job state
    JOBS[job_id] = Dict(
        "status" => "running",
        "progress" => 0.0,
        "result" => nothing,
        "error" => nothing
    )
    
    # Spawn the simulation asynchronously
    Threads.@spawn begin
        try
            # Execute simulation headless script
            result_path = run_simulation(config)
            
            # Update state on success
            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["progress"] = 100.0
            JOBS[job_id]["result"] = result_path
        catch e
            # Log and update state on error
            println("Job $job_id failed: ", e)
            JOBS[job_id]["status"] = "failed"
            JOBS[job_id]["error"] = string(e)
        end
    end
    
    # Return immediately while the task runs
    return Dict("job_id" => job_id, "status" => "accepted")
end

@get "/api/status/{job_id}" function(req::HTTP.Request, job_id::String)
    if haskey(JOBS, job_id)
        return JOBS[job_id]
    else
        return HTTP.Response(404, "Job ID not found")
    end
end

function start_server(host="0.0.0.0", port=8080)
    serve(host=host, port=port)
end

end
