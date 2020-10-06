import * as redis from "redis"
import { promisify } from "util"
import * as config from '../config.json'

let client: redis.RedisClient = null

// let ready = false
// export { ready }

// client.set("key", "value", redis.print)
// client.get("key", redis.print)
// client.set(key, value, 'EX', 60 * 60 * 24)

// get: promisify(client.get).bind(client),
// hgetall: promisify(client.hgetall).bind(client),
// set: promisify(client.set).bind(client),
// hmset: promisify(client.hmset).bind(client),

let hmget: (...args: string[]) => Promise<string[]> = () => Promise.resolve(null)
export { hmget }

let hmset_cb: (key: string, ...args: Array<string | number | redis.Callback<"OK">>) => boolean = () => null
export { hmset_cb }

let keys: (pattern: string) => Promise<string[]> = () => Promise.resolve(null)
export { keys }

let del_cb: (pattern: string, callback: redis.Callback<number>) => boolean = () => null
export { del_cb }

export function connect () {
  if (client) return Promise.resolve(client)
  let didConnect = false;
  return new Promise ((resolve, reject) => {
    client = redis.createClient()

    // "ready": client will emit ready once a connection is established. Commands issued before the ready event are queued, then replayed just before this event is emitted.
    client.on("ready", () => { console.log("redis:ready"); didConnect = true; resolve(client) }) // ready = true

    // "connect": client will emit connect as soon as the stream is connected to the server.
    client.on("connect", () => { console.log("redis:connect") })

    // "reconnecting": client will emit reconnecting when trying to reconnect to the Redis server after losing the connection. Listeners are passed an object containing delay (in ms from the previous try) and attempt (the attempt #) attributes.
    client.on("reconnecting", () => { console.log("redis:reconnecting");  }) // ready = false

    // "error": client will emit error when encountering an error connecting to the Redis server or when any other in Node Redis occurs. If you use a command without callback and encounter a ReplyError it is going to be emitted to the error listener.
    // So please attach the error listener to Node Redis.
    client.on("error", (err) => { console.error("redis:error", err); reject(Error('redis:error')) }) // ready = false

    // "end": client will emit end when an established Redis server connection has closed.
    client.on("end", () => { console.log("redis:end"); if (!didConnect) { client.end(); }; reject(Error('redis:end')) }) // ready = false

    // "warning": client will emit warning when password was set but none is needed and if a deprecated option / function / similar is used.
    client.on("warning", (p) => { console.log("redis:warning", p) })

    hmget = promisify(client.hmget).bind(client)
    hmset_cb = client.hmset.bind(client)
    keys = promisify(client.keys).bind(client)
    del_cb = client.del.bind(client)

    // return client
  })
}
