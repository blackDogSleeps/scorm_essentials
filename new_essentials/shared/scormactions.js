var currentPage = null;
var startTimeStamp = null;
var processedUnload = false;
var reachedEnd = false;
function doStart(){
  //get the iFrame sized correctly and set up
  /*SetupIFrame();*/
  //record the time that the learner started the SCO so that we can report the total time
  startTimeStamp = new Date();
  //initialize communication with the LMS
  ScormProcessInitialize();
  //it's a best practice to set the completion status to incomplete when
  //first launching the course (if the course is not already completed)
  var completionStatus = ScormProcessGetValue("cmi.core.lesson_status");
  if (completionStatus == "not attempted"){
      ScormProcessSetValue("cmi.core.lesson_status", "incomplete");
  }
}

/*    function goToPage(){
  var theIframe = document.getElementById("contentFrame");
  var prevButton = document.getElementById("butPrevious");
  var nextButton = document.getElementById("butNext");
  //navigate the iFrame to the content
  theIframe.src = "../" + pageArray[currentPage];
  //disable the prev/next buttons if we are on the first or last page.
  if (currentPage == 0){
      nextButton.disabled = false;
      prevButton.disabled = true;
  }
  else if (currentPage == (pageArray.length - 1)){
      nextButton.disabled = true;
      prevButton.disabled = false;
  }
  else{
      nextButton.disabled = false;
      prevButton.disabled = false;
  }
  //save the current location as the bookmark
  ScormProcessSetValue("cmi.location", currentPage);
  //in this sample course, the course is considered complete when the last page is reached
  if (currentPage == (pageArray.length - 1)){
      reachedEnd = true;
      ScormProcessSetValue("cmi.completion_status", "completed");
  }
}
*/

function theEnd(){
RecordTest(100);
reachedEnd = true;
doExit();
window.close();
}


function doUnload(pressedExit){
  // don't call this function twice
  if (processedUnload == true){return;}
  processedUnload = true;
  //record the session time
  var endTimeStamp = new Date();
  var totalMilliseconds = (endTimeStamp.getTime() - startTimeStamp.getTime());
  var scormTime = ConvertMilliSecondsToSCORMTime(totalMilliseconds, false);
  ScormProcessSetValue("cmi.core.session_time", scormTime);
  //if the user just closes the browser, we will default to saving
  //their progress data. If the user presses exit, he is prompted.
  //If the user reached the end, the exit normall to submit results.
  if (pressedExit == false && reachedEnd == false){
      ScormProcessSetValue("cmi.core.exit", "suspend");
  }
  ScormProcessFinish();
}
/*
function doPrevious(){
  if (currentPage > 0){
      currentPage--;
  }
  goToPage();
}
function doNext(){
  if (currentPage < (pageArray.length - 1)){
      currentPage++;
  }
  goToPage();
}
*/
function doExit(){
  //note use of short-circuit AND. If the user reached the end, don't prompt.
  //just exit normally and submit the results.
  if (reachedEnd == false && confirm("Would you like to save your progress to resume later?")){
      //set exit to suspend
      ScormProcessSetValue("cmi.core.exit", "suspend");
  }
  else{
      //set exit to normal
      ScormProcessSetValue("cmi.core.exit", "");
  }
  //process the unload handler to close out the session.
  //the presense of an adl.nav.request will cause the LMS to
  //take the content away from the user.
  doUnload(true);
}
//called from the assessmenttemplate.html page to record the results of a test
//passes in score as a percentage
function RecordTest(score){
  ScormProcessSetValue("cmi.core.score.raw", score);
  ScormProcessSetValue("cmi.core.score.min", "0");
  ScormProcessSetValue("cmi.core.score.max", "100");
  // var scaledScore = score / 100;
  // ScormProcessSetValue("cmi.score.scaled", scaledScore);
  //consider 70% to be passing
  if (score >= 70){
      ScormProcessSetValue("cmi.core.lesson_status", "completed");
      // ScormProcessSetValue("cmi.completion_status", "completed");
  }
  else{
      ScormProcessSetValue("cmi.core.lesson_status", "failed");
      // ScormProcessSetValue("cmi.completion_status", "completed");
  }
}
//SCORM requires time to be formatted in a specific way
function ConvertMilliSecondsToSCORMTime(intTotalMilliseconds, blnIncludeFraction){

var intHours;
var intintMinutes;
var intSeconds;
var intMilliseconds;
var intHundredths;
var strCMITimeSpan;

if (blnIncludeFraction == null || blnIncludeFraction == undefined){
  blnIncludeFraction = true;
}

//extract time parts
intMilliseconds = intTotalMilliseconds % 1000;

intSeconds = ((intTotalMilliseconds - intMilliseconds) / 1000) % 60;

intMinutes = ((intTotalMilliseconds - intMilliseconds - (intSeconds * 1000)) / 60000) % 60;

intHours = (intTotalMilliseconds - intMilliseconds - (intSeconds * 1000) - (intMinutes * 60000)) / 3600000;

/*
deal with exceptional case when content used a huge amount of time and interpreted CMITimstamp
to allow a number of intMinutes and seconds greater than 60 i.e. 9999:99:99.99 instead of 9999:60:60:99
note - this case is permissable under SCORM, but will be exceptionally rare
*/

if (intHours == 10000)
{
  intHours = 9999;

  intMinutes = (intTotalMilliseconds - (intHours * 3600000)) / 60000;
  if (intMinutes == 100)
  {
    intMinutes = 99;
  }
  intMinutes = Math.floor(intMinutes);

  intSeconds = (intTotalMilliseconds - (intHours * 3600000) - (intMinutes * 60000)) / 1000;
  if (intSeconds == 100)
  {
    intSeconds = 99;
  }
  intSeconds = Math.floor(intSeconds);

  intMilliseconds = (intTotalMilliseconds - (intHours * 3600000) - (intMinutes * 60000) - (intSeconds * 1000));
}

//drop the extra precision from the milliseconds
intHundredths = Math.floor(intMilliseconds / 10);

//put in padding 0's and concatinate to get the proper format
strCMITimeSpan = ZeroPad(intHours, 4) + ":" + ZeroPad(intMinutes, 2) + ":" + ZeroPad(intSeconds, 2);

if (blnIncludeFraction){
  strCMITimeSpan += "." + intHundredths;
}

//check for case where total milliseconds is greater than max supported by strCMITimeSpan
if (intHours > 9999)
{
  strCMITimeSpan = "9999:99:99";

  if (blnIncludeFraction){
    strCMITimeSpan += ".99";
  }
}

return strCMITimeSpan;

}

function ZeroPad(intNum, intNumDigits){

var strTemp;
var intLen;
var i;

strTemp = new String(intNum);
intLen = strTemp.length;

if (intLen > intNumDigits){
  strTemp = strTemp.substr(0,intNumDigits);
}
else{
  for (i=intLen; i<intNumDigits; i++){
    strTemp = "0" + strTemp;
  }
}

return strTemp;
}
