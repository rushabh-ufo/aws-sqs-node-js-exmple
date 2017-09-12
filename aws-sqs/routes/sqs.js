var express = require('express');
var router = express.Router();
var aws = require('aws-sdk');
var fs = require('fs');
aws.config.loadFromPath(__dirname + '/aws-config.json');
var sqs = new aws.SQS();

//creating queue
router.get('/createQueue', function (req, res) {
    var queueNameQuery = {
        QueueName: req.query.queueName + '.fifo'
    };
    console.log('sending query for: ', queueNameQuery);
    sqs.getQueueUrl(queueNameQuery, function (error, result) {
        if (result) {
            console.log('result: ', result.ResponseMetadata);
            queueURL = result.QueueUrl;
            console.log('QueueName : ', queueURL);
            res.send("Queue URL: " + queueURL);
        } else {
            var createQueueQuery = {
                QueueName: req.query.queueName + '.fifo',
                Attributes: {
                    FifoQueue: 'true'
                }
            }
            console.log('creating new queue: ', createQueueQuery);
            sqs.createQueue(createQueueQuery, function (error, result) {
                if (result) {
                    queueURL = result.QueueUrl;
                    fs.writeFile(__dirname + '/urlData.txt', queueURL, function (err) {
                        if (err) {
                            return console.log(err);
                        }

                        console.log("The file was saved!");
                        res.send(result);
                    });

                }
                else {
                    res.send(error);
                }
            });
        }
    });

});

//posting message to queue
router.get('/postMessage', function (req, res) {
    fs.readFile(__dirname + '/urlData.txt', { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            console.log('received data: ' + data);
            var messageObject = {
                MessageBody: req.query.message,
                QueueUrl: data,
                DelaySeconds: 0,
                MessageGroupId: '1'
            };
            console.log('sending message: ', messageObject);
            sqs.sendMessage(messageObject, function (error, result) {
                if (result) {
                    res.send(result);
                }
                else {
                    res.send(error);
                }
            });
        } else {
            console.log(err);
        }
    });

});

//receiving message from queue
router.get('/receive', function (req, res) {
    fs.readFile(__dirname + '/urlData.txt', { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            var receiveParams = {
                QueueUrl: data,
                VisibilityTimeout: 60
            };

            sqs.receiveMessage(receiveParams, function (error, result) {
                if (result) {
                    var receiptHandle = result.Messages[0].ReceiptHandle;
                    fs.writeFile(__dirname + '/receiptHandle.txt', receiptHandle, function (err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                        res.send(result);
                    });
                }
                else {
                    res.send(error);
                }
            });
        } else {
            console.log(err);
        }
    });

});

// Deleting a message from queue
router.get('/delete', function (req, res) {
    var queueUrl = '';
    var receiptHandle = '';
    fs.readFile(__dirname + '/urlData.txt', { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            queueUrl = data;
            fs.readFile(__dirname + '/receiptHandle.txt', { encoding: 'utf-8' }, function (err, data) {
                if (!err) {
                    receiptHandle = data;
                    var deleteParams = {
                        QueueUrl: queueUrl,
                        ReceiptHandle: receiptHandle
                    };

                    sqs.deleteMessage(deleteParams, function (error, result) {
                        if (result) {
                            res.send(result);
                        }
                        else {
                            res.send(error);
                        }
                    });
                } else {
                    console.log(err);
                }
            });
        } else {
            console.log(err);
        }
    });

});


module.exports = router;