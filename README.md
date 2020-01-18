# Integration Doc



## There are three parts to this project.
### Part 1. Javascript for automation (JXA) script that gets data from TimingApp & sends the data to our server.
### Part 2. A lambda function that stores the timingapp data.
### Part 3. A lambda function that generates reports and sends them into telegram. 



## Part 1. Javascript for automation (JXA) script that gets data from TimingApp & sends the data to our server.

Automatically export timingapp data and send it to the lambda function. This needs to run at least daily, accounting for network connections, mac sleeping, etc. 

The most likely approach to this will be sending the data mutliple times per day, but only using the most recent day-data when doing the reports and calculations. 




## Part 2. A lambda function that stores the timingapp data.
Recieve JSON data from timingapp. 

Example object:
```
{
   "id":"334AC0C5-72FA-43D4-A453-0A854BB75A89",
   "overallTotal":33567.66305065155,
   "timesPerProject":{
      "Web Browsing ▸ Media ▸ Media":405.5308451652527,
      "Sample Projects ▸ Reading & Writing":18.144479751586914,
      "Sample Projects ▸ Graphics":311.6760652065277,
      "Unproductive":9509.152252912521,
      "Personal Growth":2380.0372042655945,
      "(No Project)":1102.59903216362,
      "DeepHire":11031.237657785416,
      "Sample Projects ▸ Gaming":52.98618030548096,
      "Sample Projects ▸ File Management":226.30252170562744,
      "News & Procrastination":107.90970182418823,
      "Development":353.93126249313354,
      "Social Media":484.59845781326294,
      "Web Browsing":7583.557389259338
   },
   "overallTotalWithoutTasks":33567.66305065155,
   "productivityScore":0.5532164597844379,
   "timesPerProjectWithoutTasks":{
      "Sample Projects ▸ Reading & Writing":18.144479751586914,
      "Web Browsing ▸ Media ▸ Media":405.5308451652527,
      "Sample Projects ▸ Graphics":311.6760652065277,
      "Unproductive":9509.152252912521,
      "(No Project)":1102.59903216362,
      "Personal Growth":2380.0372042655945,
      "DeepHire":11031.237657785416,
      "Sample Projects ▸ Gaming":52.98618030548096,
      "Sample Projects ▸ File Management":226.30252170562744,
      "News & Procrastination":107.90970182418823,
      "Development":353.93126249313354,
      "Social Media":484.59845781326294,
      "Web Browsing":7583.557389259338
   },
   "pcls":"timeSummary"
}
```
Times are in seconds.

We need to store that data in our database whenever we recieve an api call. 



## Part 3. A lambda function that generates reports and sends them into telegram. 
In the first release, this can just run daily, and grab the most recent report data from the database, and send it in our telegram group via the telegram bot.
