const zmq = require("zeromq");

export class MessageReceiver {
  private _message_type: string;
  private _source_url: string;

  constructor(message_type: string, source_url: string) {
    this._message_type = message_type;
    this._source_url = source_url;
  }

  watch_for_messages = async () => {
    const sock = new zmq.Subscriber();

    sock.connect(`tcp://${this._source_url}`);
    sock.subscribe("acars");
    console.log(`${this._source_url}`);

    for await (const [topic, msg] of sock) {
      console.log(
        "received a message related to:",
        String(topic),
        "containing message:",
        String(msg)
      );
    }
  };
}
