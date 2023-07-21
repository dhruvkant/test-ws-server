import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });

wss.on('connection', function connection(ws) {
  ws.on('message', function message(data) {
    const parsedData = JSON.parse(data);
    console.log('data received %s', parsedData);
    switch (parsedData?.messageType) {
      case 'INITIATE_CALL':
        console.log(
          'sending CALL_STATE_UPDATE, PTT_STATE_UPDATE, CALLEE_STATE_UPDATE'
        );
        ws.send(JSON.stringify({
          messageType: 'CALL_STATE_UPDATE',
          callId: '343',
          callStateChange: 'ESTABLISHED',
          reason: 'dfdf',
        }));
        ws.send(JSON.stringify({
          messageType: 'PTT_STATE_UPDATE',
          pttState: 'FREE',
        }));
        if (this.callStateError === 'ALL_CALLEES_BUSY') {
          parsedData.callees?.forEach((currentCallee) => {
            ws.send(JSON.stringify({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'BUSY',
              callee: {
                uid: currentCallee.uid,
                calleeType: currentCallee.calleeType,
              },
            }));
          });
        } else if (this.callErrorState === 'USERS_UNAVAILABLE') {
          // the first callee is in IN_CALL state
          ws.send(JSON.stringify({
            messageType: 'CALLEE_STATE_UPDATE',
            callId: '343',
            calleeState: 'BUSY', //Record 1
            callee: {
              uid: parsedData.callees[0].uid,
              calleeType: parsedData.callees[0].calleeType,
            },
          }));
          // the second callee is in OUT_OF_CALL state
          if (parsedData.callees[1]) {
            ws.send(JSON.stringify({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'IN_CALL', //Record 2
              callee: {
                uid: parsedData.callees[1].uid,
                calleeType: parsedData.callees[1].calleeType,
              },
            }));
          }
          // the third callee is in BUSY state
          if (parsedData.callees[2]) {
            ws.send(JSON.stringify({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'NON_EXISTING', //record 3
              callee: {
                uid: parsedData.callees[2].uid,
                calleeType: parsedData.callees[2].calleeType,
              },
            }));
          }
        } else {
          // There are some callees in the call.
          if(Array.isArray(parsedData.callees)){
            // the first callee is in IN_CALL state
            ws.send(JSON.stringify({
              messageType: 'CALLEE_STATE_UPDATE',
              callId: '343',
              calleeState: 'BUSY', // record 1
              callee: {
                uid: parsedData.callees[0].uid,
                calleeType: parsedData.callees[0].calleeType,
              },
            }));
            // the second callee is in OUT_OF_CALL state
            if (parsedData.callees[1]) {
              ws.send(JSON.stringify({
                messageType: 'CALLEE_STATE_UPDATE',
                callId: '343',
                calleeState: 'IN_CALL', //Record 2
                callee: {
                  uid: parsedData.callees[1].uid,
                  calleeType: parsedData.callees[1].calleeType,
                },
              }));
            }
            // the third callee is in BUSY state
            if (parsedData.callees[2]) {
              ws.send(JSON.stringify({
                messageType: 'CALLEE_STATE_UPDATE',
                callId: '343',
                calleeState: 'NON_EXISTING', //record 3
                callee: {
                  uid: parsedData.callees[2].uid,
                  calleeType: parsedData.callees[2].calleeType,
                },
              }));
            }
            // the fourth callee is in OFFLINE state
            // if (parsedData.callees[3]) {
            //   ws.send({
            //     messageType: 'CALLEE_STATE_UPDATE',
            //     callId: '343',
            //     calleeState: 'OFFLINE',
            //     callee: {
            //       uid: parsedData.callees[3].uid,
            //       calleeType: parsedData.callees[3].calleeType,
            //     },
            //   });
            // }
          }else{
            // broadcast call active and callees are one group.
            
          }
          
        }
        // this would be useful in PTT state updates
        this.callee = {
          uid: parsedData.callees[0].uid,
          calleeType: parsedData.callees[0].calleeType,
        };
        break;
      case 'INITIATE_EMERGENCY_CALL':
        console.log(
          'sending CALL_STATE_UPDATE, PTT_STATE_UPDATE, CALLEE_STATE_UPDATE'
        );
        ws.send(JSON.stringify({
          messageType: 'CALL_STATE_UPDATE',
          callId: '343',
          callStateChange: 'ESTABLISHED',
          reason: 'dfdf',
        }));
        ws.send(JSON.stringify({
          messageType: 'CALLEE_STATE_UPDATE',
          callId: '343',
          calleeState: 'IN_CALL',
          callee: {
            uid: parsedData.callee.uid,
            calleeType: parsedData.callee.calleeType,
          },
        }));
        this.callee = {
          uid: parsedData.callee.uid,
          calleeType: parsedData.callee.calleeType,
        };
        ws.send(JSON.stringify({
          messageType: 'PTT_STATE_UPDATE',
          // pttState: 'FREE',
          // pttState: 'ASSIGNED_THIS_USER',
          pttState: 'ASSIGNED_OTHER_USER',
          pttOwner: this.callee,
        }));
        break;
      case 'REQUEST_PTT':
        if (this.pttAssignment.assignment !== 'currentUser') {
          console.log('sending PTT_STATE_UPDATE - ASSIGNED_OTHER_USER');
          ws.send(JSON.stringify({
            messageType: 'PTT_STATE_UPDATE',
            pttState: 'ASSIGNED_OTHER_USER',
            pttOwner: this.callee,
          }));
        } else {
          console.log('sending PTT_STATE_UPDATE - ASSIGNED_THIS_USER');
          ws.send(JSON.stringify({
            messageType: 'PTT_STATE_UPDATE',
            pttState: 'ASSIGNED_THIS_USER',
          }));
        }
        break;
      case 'RELEASE_PTT':
        console.log('sending PTT_STATE_UPDATE - FREE');
        ws.send(JSON.stringify({
          messageType: 'PTT_STATE_UPDATE',
          pttState: 'FREE',
        }));
        break;
      case 'TERMINATE_CALL':
        console.log('CALL_STATE_UPDATE - TERMINATED');
        ws.send(JSON.stringify({
          messageType: 'CALL_STATE_UPDATE',
          callId: '343',
          callStateChange: 'TERMINATED',
          reason: 'dfdf',
        }));
        break;
      case 'REGISTER':
        console.log('received register command');
        ws.send(JSON.stringify({
          messageType: 'REGISTRATION_STATE_UPDATE',
          registrationState: this.registerFail
            ? 'REGISTER_ERROR'
            : 'REGISTERED',
        }));
        break;
    }
  });
});