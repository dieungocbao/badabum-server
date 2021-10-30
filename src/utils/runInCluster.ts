import * as cluster from 'cluster'
import * as os from 'os'

export function runInCluster(bootstrap: () => Promise<void>) {
  const numberOfCores = os.cpus().length
  // @ts-ignore: Unreachable code error
  if (cluster.isMaster) {
    console.log(`Primary ${process.pid} is running`)

    // Fork workers.
    for (let i = 0; i < numberOfCores; i++) {
      // @ts-ignore: Unreachable code error
      cluster.fork()
    }
    // @ts-ignore: Unreachable code error
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`)
    })
  } else {
    console.log(`Worker ${process.pid} started`)
    bootstrap()
  }
}
