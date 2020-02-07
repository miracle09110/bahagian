$(document).ready(function() {
  var createFolderList = result => {
    var unlockView = "";
    var lockView = "";
    var innerHTML = "";
    result.topics.forEach((element, index) => {
      if (element.authorized) {
        unlockView = "block";
        lockView = "block";
      } else {
        unlockView = "none";
        lockView = "block";
      }

      var unlockedHTML =
        '<div class="folder" id="' +
        element.topic.id +
        '" style="display:' +
        unlockView +
        '"><div class="unlock-state"><div class="info"><i class="fa fa-folder-open fa-lg fa-fw"></i><p>' +
        element.topic.name +
        '</p></div><div class="action"><i class="fa fa-check-circle fa-lg fa-fw"></i></div></div></div>';

      var lockedHTML =
        '<div class="folder" id="' +
        element.topic.id +
        '" style="display:' +
        lockView +
        '"><div class="lock-state"><div class="info"><i class="fa fa-folder fa-lg fa-fw"></i><p>' +
        element.topic.name +
        '</p></div><div class="action"><i class="fa fa-lock fa-lg fa-fw"></i></div></div></div>';
      innerHTML += unlockedHTML + lockedHTML;
      if (index === result.topics.length - 1) {
        document.getElementById("topics").innerHTML = innerHTML;
      }
    });
  };

  $.ajax({
    type: "GET",
    url: "https://localhost:5000/api/v1.0.0/topics",
    success: createFolderList,
    error: function(result) {
      console.log(result);
      alert("Page could not load, could you try reloading?");
    }
  });
});
