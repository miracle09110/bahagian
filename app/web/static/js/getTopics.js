$(document).ready(function() {
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

var createFolderList = result => {
  result.topics.forEach((element, index) => {
    var folder = document.createElement("div");
    folder.id = element.topic.id;

    var state = document.createElement("div");

    var info = document.createElement("div");
    info.className = "info";

    var action = document.createElement("div");
    action.className = "action";

    var folderIcon = document.createElement("i");
    var icon = document.createElement("i");
    var text = document.createElement("p");
    text.innerHTML = element.topic.name;

    if (element.authorized) {
      folder.className = "folder collection-item z-depth-4";
      state.className = "unlock-state";
      icon.className = "fa fa-check-circle fa-lg fa-fw";
      folderIcon.className = "fa fa-folder-open fa-lg fa-fw";
    } else {
      folder.className = "folder collection-item z-depth-1 teal darken-1";
      state.className = "lock-state";
      icon.className = "fa fa-lock fa-lg fa-fw";
      folderIcon.className = "fa fa-folder fa-lg fa-fw";
    }

    info.appendChild(folderIcon);
    info.appendChild(text);
    action.appendChild(icon);
    state.appendChild(info);
    state.appendChild(action);
    folder.appendChild(state);

    document.getElementById("topics").appendChild(folder);
  });
};
