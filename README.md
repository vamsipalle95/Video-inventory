# FLECT Chime meeting 
This is a video conference system with amazon chime sdk. This software uses AWS as backend. If you have AWS account, it is very easy to deploy. And this software has various features such as fast and accurate virtual backgournd, noise suppression, sounde effect and BGM. And this software has features to assist video conferencing, whiteboard, text chat, recording.


# Features
- integrated with amazon cognito
- tileview
  
![tileview](https://user-images.githubusercontent.com/48346627/109093321-827ea800-775b-11eb-8b6f-120b45578876.gif)

- virtual background
  - BodyPix and GoogleMeet
  
![virtualbackground](https://user-images.githubusercontent.com/48346627/109092422-d8eae700-7759-11eb-8ea2-c1971ce35b4e.gif)

- noise suppression and SE/BGM
  
  https://youtu.be/6hY75vtI3rM


- contents sharing and white board

![whiteboard](https://user-images.githubusercontent.com/48346627/109094301-0dac6d80-775d-11eb-9fb3-c1b3a0530b49.gif)

- chat

- recording

![recorder](https://user-images.githubusercontent.com/48346627/109095121-78aa7400-775e-11eb-9ce9-9b4fd737b750.gif)

## Experimental Feature (pre-release)
- Amongus automute and share screen.

![image](https://user-images.githubusercontent.com/48346627/122492356-8f801980-d020-11eb-992e-5554e287a401.png)

[see detail 1](https://docs.google.com/presentation/d/1UPqvkWyP28nXZ4L6EC_o3a8-HfJAJ6E8erHif4dLlBk/edit?usp=sharing)
[see detail 2](https://docs.google.com/presentation/d/1UCM8z6K3SsFidQAR3CJ9agdVtIfhbnM77iZaFtdsAPk/edit?usp=sharing)


# Installation

## Prerequisite
### (1) setup AWS Credential
It is assumed that AWS Credential is configured. If you have not yet done so, please refer to this page to configure it.

https://docs.aws.amazon.com/sdk-for-java/v1/developer-guide/setup-credentials.html

### (2) install AWS CLI
To know how to install, see the official document.

For Linux
```
https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2-linux.html
```

For Windows
```
https://docs.aws.amazon.com/ja_jp/cli/latest/userguide/install-cliv2-windows.html
```

### (3) install node
see [nodejs's offical page](https://nodejs.org/en/)

If you use debian as a root, below may help.

```
$ ### install nodejs
$ apt install -y curl
$ curl -sL https://deb.nodesource.com/setup_lts.x | bash -
$ apt install -y nodejs

$ ### install n and upgrade node, npm.
$ npm install -g n
$ n latest
$ npm update -g npm
```

### (4) install docker (optional)
If you want to build HMM (Headless Meeting Manager), you should install docker.
HMM run on AWS Fargate which needs docker image. In building process, this docker image is created. 

see [docker offical page](https://docs.docker.com/engine/install/)

You can disable HMM, in backend config mentioned later.


## Build backend
### (1) define stack name
Define the stack name for backend.
```
$ emacs backend/bin/config.ts

export const BACKEND_STACK_NAME = 'BackendStack' # <-- You should change. (*1)
export const FRONTEND_LOCAL_DEV = false          # <-- Set false for deployment(only for developper).
export const USE_DOCKER = false                  # <-- If you want to build HMM, changet to true(only for developper).
export const USE_CDN = false                     # <--- If you want to use cloudfront, set true
```
(*1) This demo uses S3 bucket whose name is defined with this value. So, this value should be global unique.

### (2) build and deploy backend
You can build and deploy by executing commands below. When the command confirm deploying is ok or not, choose "y".
```
$ cd backend
$ npm install
$ npm run build_all
```

## Build frontend
Note: frontend and fontend2,3 are depricated. Please use frontend4

### (1) build
when you run `npm run build`, you get the information of backend

#### (1-1) For linux and mac
```
$ cd frontend4
$ npm install
$ npm run build
```

#### (1-2) For Windows
It is better to use debian on docker or wsl2 and follow (1-1) above. If you really want to use windows, you can use this command. However, it is not guaranteed.
```
$ cd frontend4
$ npm install
$ npm run build
$ node bin/importBackendSetting.js
$ node script/list_resources.js
$ npx react-scripts build
```


### (2) deploy frontend
#### (2-1) For linux and mac
```
$ sh sync.sh
```
#### (2-2) For Windows
It is better to use debian on docker or wsl2 and follow (1-1) above. If you really want to use windows, open `sync.sh` with the notepad and exec the command in the file.


### (3) access to the demo
You can find URL of demo in `demo_url.txt`. Please access this URL with browser.


# Delete Stack
At first, delete all data from backet. You can get the bucket name with this command.
```
$ cd backend
$ cat cfn_outputs.json |grep -e "Bucket"
    "BucketDomainName": "xxxxxxxxxxxx.s3.amazonaws.com",
    "Bucket": "xxxxxxxxxxxxxxxxxxxx",                       <- this is bucket name
    "BucketWebsiteDomainName": "xxxxxxxxxxxxxx.s3-website-us-east-1.amazonaws.com"

```


Then, execute this command.
```
$ npx cdk destroy
```


# Warning!!
In this demo, google meet model for virtual background is used. At the time I started develop, the license of the model is APACHE-2.0. But currently the license is changed and not APACHE-2.0 any more. I'm not a lawyer, and I don't know much about it, but I generally believe that license changes do not apply retroactively to previous deliverables. However, you should obtain and(or) use the model at your own risk. 

Detail about this is [here](https://github.com/tensorflow/tfjs/issues/4177)

# Acknowledgement
## Resources
1. Images from https://www.irasutoya.com/
2. Sounds from https://otologic.jp
3. movie from https://www.youtube.com/, https://pixabay.com/ja/videos/


# Appendix
## update cdk
```
$ sudo npm update -g aws-cdk
```
## tail Log
```
aws logs tail --follow  API-Gateway-Execution-Logs_gvrxxxx89/prod
```


## memo (Japanese)

ローカルで開発する場合は、Clientから起動してから先にdokcer containerで起動する。
meeting_URLはconsoleから取れる。

backend/lib/manager$ docker build -t hmm .

docker run -p 3000:3000 -v `pwd`:/work --env MEETING_URL="xxx"  --env BUCKET_ARN="xxx" dannadori/hmm


$ docker build -t dannadori/hmm . --no-cache
$ docker login
$ docker push dannadori/hmm 

