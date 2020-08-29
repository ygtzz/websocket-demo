const Koa = require('koa'),
  route = require('koa-route'),
  websockify = require('koa-websocket')
  fs = require('fs');
 
var key = fs.readFileSync('./ssl/private.key');
var cert = fs.readFileSync('./ssl/mydomain.crt');

var options = {
    key: key,
    cert: cert
};

const app = websockify(new Koa(),{},{
    key: key,
    cert: cert
});
 
// Regular middleware
// Note it's app.ws.use and not app.use
app.ws.use(function(ctx, next) {
  // return `next` to pass the context (ctx) on to the next ws middleware
  return next(ctx);
});
 
// Using routes
app.ws.use(route.all('/test/:id', function (ctx) {
  // `ctx` is the regular koa context created from the `ws` onConnection `socket.upgradeReq` object.
  // the websocket is added to the context on `ctx.websocket`.
//   ctx.websocket.send(json2blob({server:'hello'}));
  ctx.websocket.on('message', function(message) {
    // do something with the message from client
    let msgType = Object.prototype.toString.call(message);
    let msg = '';
    if(msgType == '[object String]'){
        msg = message;
    }   
    else if(msgType == '[object Uint8Array]'){
        msg = message.toString();
        msg = JSON.parse(msg);
    }

    let res = JSON.stringify(
        {
            server: '收到 ' + msg.client || msg
        }
    );

    ctx.websocket.send(strToBuffer(res));
  });
}));
 
app.listen(3000);

function strToBuffer(str){
    return Buffer.from(str);
}