import {version} from '../../package.json'
import {wsServer, wsPort, imageServer} from '../../../server/share'
const WS_PROTOCOL = 'wss://'
export default {
  WS_PROTOCOL,
  SERVER_IP:wsServer,
  WS_SERVER:`${WS_PROTOCOL}${wsServer}:${wsPort}`,
  WS_PORT:wsPort,
  IMAGE_SERVER:imageServer,
  VERSION:version
}