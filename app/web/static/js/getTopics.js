const contributionAPI = "/api/v1.0.0/contribution/";
const contributionEncryptionType = "multipart/form-data";

$(document).ready(function() {
  console.log("triggered");
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

const uploadFile = topicId => {
  const modalForm = document.getElementById(`form-${topicId}`);
  const control = document.getElementById(`input-${topicId}`);
  var files = control.files;

  const confirmButton = document.getElementById(`confirm-${topicId}`);
  confirmButton.addEventListener("click", function(event) {
    event.preventDefault();
    const data = new FormData();
    data.append("contribution", files[0]);
    const request = new XMLHttpRequest();
    request.open(modalForm.method, modalForm.action);
    request.onload = function() {
      console.log("Upload complete.");
    };
    request.send(data);
  });
};

var createFolderList = async result => {
  await result.topics.forEach((element, index) => {
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

      action.appendChild(icon);
    } else {
      folder.className = "folder collection-item z-depth-1 teal darken-1";
      state.className = "lock-state";
      folderIcon.className = "fa fa-folder fa-lg fa-fw";
      icon.className = "fa fa-lock fa-lg fa-fw tooltipped";
      icon.setAttribute("data-position", "bottom");
      icon.setAttribute("data-tooltip", "Unlock");

      //anchoring image
      var unlockAnchor = document.createElement("a");

      var modalId = `modal-${element.topic.id}`;
      unlockAnchor.className = "waves-effect waves-light modal-trigger";
      unlockAnchor.setAttribute("href", `#${modalId}`);
      unlockAnchor.appendChild(icon);
      action.appendChild(unlockAnchor);

      //Modal creation follows
      var formId = `form-${element.topic.id}`;
      var modal = document.createElement("div");
      modal.id = modalId;
      modal.className = "modal";

      var modalContent = document.createElement("div");
      modalContent.className = "modal-content";

      var modalContentHeader = document.createElement("h4");
      modalContentHeader.innerHTML = `Gain access to ${element.topic.name}`;

      var modalContentBody = document.createElement("p");
      modalContentBody.innerHTML =
        "You will only be granted access to the requested topic once you upload a file. After contribution, access link will be sent to your email ";

      modalContent.appendChild(modalContentHeader);
      modalContent.appendChild(modalContentBody);

      //Form in modal creation follows
      var form = document.createElement("form");
      form.id = formId;
      form.action = contributionAPI + element.topic.id;
      form.method = "post";
      form.enctype = contributionEncryptionType;

      var fileInput = document.createElement("div");
      fileInput.className = "file-field input-field";

      var fileUploadButton = document.createElement("div");
      fileUploadButton.className = "btn";

      var spanFileUploadButton = document.createElement("span");
      spanFileUploadButton.innerHTML = "File";

      var inputFileUploadButton = document.createElement("input");
      var inputFileUploadButtonId = `input-${element.topic.id}`;
      inputFileUploadButton.id = inputFileUploadButtonId;
      inputFileUploadButton.name = inputFileUploadButtonId;
      inputFileUploadButton.type = "file";
      inputFileUploadButton.addEventListener("change", function(event) {
        uploadFile(element.topic.id);
      });

      fileUploadButton.appendChild(spanFileUploadButton);
      fileUploadButton.appendChild(inputFileUploadButton);

      var wrapperFileUploadButton = document.createElement("div");
      wrapperFileUploadButton.className = "file-path-wrapper";
      wrapperFileUploadButton.innerHTML =
        '<input class="file-path validate" type="text" place-holder="Contribution File">';

      fileInput.appendChild(fileUploadButton);
      fileInput.appendChild(wrapperFileUploadButton);

      form.appendChild(fileInput);

      modalContent.appendChild(form);

      modal.appendChild(modalContent);

      //Modal footer
      var modalFooter = document.createElement("div");
      modalFooter.className = "modal-footer";

      var cancelButton = document.createElement("a");
      cancelButton.className = "modal-close waves-effect waves-green btn-flat";
      cancelButton.href = "#!";
      cancelButton.innerHTML = "Cancel";

      modalFooter.appendChild(cancelButton);

      var confirmButton = document.createElement("a");
      var confirmButtonId = `confirm-${element.topic.id}`;
      confirmButton.id = confirmButtonId;
      confirmButton.name = confirmButtonId;
      confirmButton.className =
        "waves-effect white-text blue waves-green btn-flat";
      confirmButton.innerHTML = "Confirm";

      modalFooter.appendChild(confirmButton);

      modal.appendChild(modalFooter);

      action.appendChild(modal);
    }

    info.appendChild(folderIcon);
    info.appendChild(text);
    state.appendChild(info);
    state.appendChild(action);
    folder.appendChild(state);

    document.getElementById("topics").appendChild(folder);
  });

  $(".tooltipped").tooltip();
  $(".modal").modal();
};
