let contributionAPI = "/api/v1.0.0/contribution/";
let contributionEncryptionType = "multipart/form-data";

$(document).ready(function() {
  requestTopics();
});

const requestTopics = () => {
  $.ajax({
    type: "GET",
    url: "https://127.0.0.1:5000/api/v1.0.0/topics",
    success: createFolderList,
    error: function(result) {
      console.log(result);
      alert("Page could not load, could you try reloading?");
    }
  });
};

const showSuccess = visibleModal => {
  M.Modal.getInstance(visibleModal).close();
  M.toast({
    html: "Access granted",
    classes: "green"
  });
};

const showError = (errMessage, modalForm) => {
  modalForm.reset();
  M.toast({
    html: errMessage,
    classes: "red"
  });
};

const showProgress = visibleModal => {
  const progressBar = visibleModal.getElementsByClassName("progress")[0];
  const footer = visibleModal.getElementsByClassName("modal-footer")[0];
  const form = visibleModal.getElementsByTagName("form")[0];
  progressBar.style.display = "block";
  footer.style.display = "none";
  form.style.display = "none";
};

const showForm = visibleModal => {
  const progressBar = visibleModal.getElementsByClassName("progress")[0];
  const footer = visibleModal.getElementsByClassName("modal-footer")[0];
  const form = visibleModal.getElementsByTagName("form")[0];
  progressBar.style.display = "none";
  footer.style.display = "block";
  form.style.display = "block";
};

const sendUploadRequest = (visibleModal, modalForm, files) => {
  const data = new FormData();
  data.append("contribution", files[0]);
  const request = new XMLHttpRequest();
  request.open(modalForm.method, modalForm.action);
  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      //4 == DONE based on library
      switch (request.status) {
        case 201:
          showSuccess(visibleModal);
          requestTopics();
          break;
        case 415:
          showError("Invalid file. Please use .doc, .docx, or .pdf", modalForm);
          showForm(visibleModal);
          break;
        case 400:
          showError("Oops! may mali. Try re-uploading file", modalForm);
          showForm(visibleModal);
          break;
        case 500:
        default:
          showError(
            "Hindi ko gets ang nangyari, paki-refresh naman",
            modalForm
          );
          showForm(visibleModal);
      }
    }
  };
  request.send(data);
};

const uploadFile = topicId => {
  const modalForm = document.getElementById(`form-${topicId}`);
  const control = document.getElementById(`input-${topicId}`);
  var files = control.files;

  const confirmButton = document.getElementById(`confirm-${topicId}`);
  confirmButton.addEventListener("click", function(event) {
    event.preventDefault();

    const visibleModal = document.getElementById(`modal-${topicId}`);
    showProgress(visibleModal);
    sendUploadRequest(visibleModal, modalForm, files);
  });
};

const getContributions  = async topicId => {
  $.ajax({
    type: "GET",
    url: `https://127.0.0.1:5000/api/v1.0.0/contribution/${topicId}`,
    success: (results) => {
      appendContributions(results,topicId)
    },
    error: function (result) {
      console.log(`Error on ${topicId} `); 
    }
  });
}

const appendContributions = async (results,topicId) => {

  let folderItem = document.getElementById(`container-${topicId}`);

  let documentList = document.createElement("div");
  documentList.className = "collapsible-body grey";

  let unorderedList = document.createElement("ul");
  unorderedList.className = "collection";

  folderItem.appendChild(documentList);
  documentList.appendChild(unorderedList);

  await results.contributions.forEach(element => {
    
    let listItem = document.createElement("li");
    listItem.className = "collection-item";
    listItem.innerHTML = element.name;

    unorderedList.appendChild(listItem);
   
  }); 

}


var createFolderList = async result => {
  //reset folder list
  document.getElementById("topics").innerHTML =
    '<li class="collection-header"><h4>Topics</h4></li >';

  await result.topics.forEach((element, index) => {
  
    //Create Format of a Folder;
    let listItem = document.createElement("li");
    let folder = document.createElement("div");
    folder.id = element.topic.id;

    let info = document.createElement("div");
    info.className = "info";
    
    let infoIcon = document.createElement("i");
    infoIcon.className = "small material-icons";

    let infoText = document.createElement("p");
    infoText.innerHTML = element.topic.name;

    let action = document.createElement("div");
    action.className = "action";

    let actionIcon = document.createElement("i");

    listItem.appendChild(folder);
    folder.appendChild(info);
    folder.appendChild(action);
    info.appendChild(infoIcon);
    info.appendChild(infoText);
    
    if (element.authorized) {
      listItem.className = "z-depth-4";
      listItem.id = `container-${element.topic.id}`;
      folder.className = "folder collapsible-header";
      infoIcon.innerHTML = "folder_shared";

      actionIcon.className = "end-item small material-icons";
      actionIcon.innerHTML = "more_vert";
      action.appendChild(actionIcon);

      getContributions(element.topic.id);

    } else {
      listItem.className = "teal collection-item";
      folder.className = "folder";
      infoIcon.innerHTML = "block";

    
      actionIcon.className = "end-item small material-icons tooltipped";
      actionIcon.innerHTML = "info"
      actionIcon.setAttribute("data-position", "bottom");
      actionIcon.setAttribute("data-tooltip", "Unlock");

      //anchoring icon
      var unlockAnchor = document.createElement("a");

      var modalId = `modal-${element.topic.id}`;
      unlockAnchor.className = "waves-effect waves-light modal-trigger";
      unlockAnchor.setAttribute("href", `#${modalId}`);
      unlockAnchor.appendChild(actionIcon);
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

      // adding hidden progress bar
      var progressbar = document.createElement("div");
      progressbar.className = "progress";
      progressbar.style.display = "none";
      var progressbarType = document.createElement("div");
      progressbarType.className = "indeterminate";
      progressbar.appendChild(progressbarType);

      //Assemble modal body
      modalContent.appendChild(modalContentHeader);
      modalContent.appendChild(modalContentBody);
      modalContent.appendChild(progressbar);

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
      inputFileUploadButton.addEventListener("change", function (event) {
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

    document.getElementById("topics").appendChild(listItem);
  });

  $(".tooltipped").tooltip();
  $(".modal").modal();
  $('.collapsible').collapsible();
};
