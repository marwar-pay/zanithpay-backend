const Queue = require('bull');
 
export const transactionQueue = new Queue('transactionQueue', {
    redis: {
        host: '127.0.0.1',
        port: 6379,
    },
});