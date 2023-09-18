## The Kazi Ipo Mobile App and its motivation 
Kazi ipo is an East African Swahili phrase that means “there is work and people are committed to
that work” or simply “there is work”. This is a task management app that serves users whose
tasks are location based. Specifically, technicians who move from place to place to do repairs
and maintenance of previously installed machinery or equipment. For example, technicians who
engage in maintenance and repair of machinery and equipment supplied to various customers
living in a certain locality. Examples of this equipment are laundry machines at various drycleaning outlets. There is a great need to have a simple to use app for these users whose tasks
are location based. Most apps over emphasize time and date reminders on task management
leaving out this niche of users. 

## Challenges faced by roaming technicians. 
- Because their work is location based, they need location reminders Lin, Hung and Huang
(2012)
- Due to limited time, they spend on their gadgets they need simple easy to use apps with
smooth learning curves (Lund and Wiese, 2021) 


## Aims of the project. 
- A responsive task management mobile app allowing users to create accounts.
- Establishing meaningful locations
- Create, update, view, cancel tasks based on locations.
- Task triggers/ reminders when a user is at predefined location

## Tools
- React Native
- Expo CLI

## Main Features
- Save Locations
- Save Taks associated with Locations
- Trigger Location based reminders

## Installation and usage
- Download `Nodejs` from `https://nodejs.org/dist/v20.6.0/node-v20.6.0-x64.msi`
- Clone this repository to your computer `git clone repo-url`
- Create a `.env` file and add your google maps key `EXPO_PUBLIC_GOOGLEMAPSKEY=key`, get the key from [Maps Key](https://console.cloud.google.com/google/maps-apis/overview)
- Install dependencies `npm install`
- Run `npx expo start`
- Scan on `expo go` or run on android/ios emulator
- Expo - `https://docs.expo.dev/get-started/installation/`