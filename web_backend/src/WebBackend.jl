module WebBackend

include("simulation_runner.jl")
include("server.jl")

export run_server

function run_server(; host="0.0.0.0", port=8080)
    Server.start_server(host, port)
end

end
