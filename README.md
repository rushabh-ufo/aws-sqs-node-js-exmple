# AWS_Samples
This code helps understand queing mechanism on AWS SQS using AWS_SDK on Node. This also uses the file library of node.
Follow the steps below to test the app.

#ssh into the EC2 instance

ssh -i <Path_to_PEM> ec2-user@<IP>

#update packages

sudo yum update

#Install node server

curl --location https://rpm.nodesource.com/setup_6.x | sudo bash -

sudo yum install -y nodejs

#deploy code to EC2

scp -r -i <PATH_TO_PEM> <PATH_TO_CODE>/aws-sqs ec2-user@<IP>:/home/ec2-user/aws-sqs

cd aws-sqs

npm install

npm start

# Use below API to simulate queue
<EC2_IP>:3000/sqs/createQueue?queueName=<QUEUE_NAME>

<EC2_IP>:3000/sqs/postMessage?message=Hi

<EC2_IP>:3000/sqs/receive

<EC2_IP>:3000/sqs/delete


