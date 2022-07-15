import net from 'net';
import { EventEmitter } from 'events';

const PIPE_PREFIX = '\\\\.\\pipe\\';

export declare interface PipeServer {
  on(evt: 'data', cb: (data: string) => void): this;
  on(evt: 'error', cb: (error: Error) => void): this;
  on(evt: 'connection', cb: (client: net.Socket) => void): this;
  on(evt: 'disconnected', cb: (client: net.Socket) => void): this;
}

// https://nodejs.org/api/net.html#class-netsocket
export class PipeServer extends EventEmitter {
  private pip!: net.Server;

  constructor() {
    super();
    this.pip = net.createServer((client: net.Socket) => {
      client.on('connect', () => {
        this.emit('connection', client);
      });
      client.on('close', (had_error) => {
        this.emit('disconnected', client);
      });
      client.on('data', (data: Buffer) => {
        this.emit('data', data.toString());
      });
      client.on('error', (error: Error) => {
        this.emit('error', error);
      });
    });
  }

  listen = (pipeName: string) => {
    this.pip.listen(`${PIPE_PREFIX}${pipeName}`);
  };

  close = () => {
    this.pip.close((err) => {
      if (err) this.emit('error', err);
    });
  };

  send = (client: net.Socket, data: string | Uint8Array) => {
    client.write(data, (err) => {
      if (err) this.emit('error', err);
    });
  };
}
