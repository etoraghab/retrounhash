import Peer from "peerjs";
import { user } from './gun';

export let peer = new Peer();
peer.on("open", (id) => {
    user.get("call").get("id").put(id);
});