const showLoading = () => {
  document.getElementById("add-topic-form").style.display = "none";
  document.getElementById("add-topic-loading").style.display = "block";
};

const showAddForm = () => {
  document.getElementById("add-topic-form").style.display = "block";
  document.getElementById("add-topic-loading").style.display = "none";
};

const onSubmitTopicForm = () => {
  $("#add-topic-form").submit(function(event) {
    event.preventDefault();
    const form = event.target;
    const topic = form.elements["topic_name"];

    if (!topic.value) {
      M.toast({
        html: "Please provide topic name",
        classes: "red"
      });
      return false;
    }

    M.toast({ html: "Updating...", classes: "purple" });
    showLoading();
    $.ajax({
      type: "POST",
      url: "https://localhost:5000/api/v1.0.0/topic",
      data: JSON.stringify({ name: topic.value }),
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        M.toast({ html: "Topic added!", classes: "green" });
        document.getElementById("add-topic-form").reset();
        showAddForm();
        $.getScript("/js/getTopics.js", function() {
          requestTopics();
        });
        return false;
      },
      error: function(data) {
        showAddForm();
        M.toast({
          html: "Error adding topic, please try again",
          classes: "red"
        });
        document.getElementById("add-topic-form").reset();
        return false;
      }
    });
  });
};
