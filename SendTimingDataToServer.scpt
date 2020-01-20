Timing = Application('TimingHelper')

var date = new Date();
var data = Timing.getTimeSummary({between:date, and: date}).properties()
var jsonData = JSON.stringify(data)
app = Application.currentApplication()
app.includeStandardAdditions = true;
result = app.doShellScript(`curl -d '${jsonData}' -H "Content-Type: application/json" -X POST "https://api.russell.work/time_tracking"`)

JSON.stringify(result)