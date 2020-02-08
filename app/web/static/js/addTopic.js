const onSubmitTopicForm = () => {
  $("#add-topic-form").submit(function(event) {
    console.log(event);
    const form = event.target;
    const topic = form.elements["topic_name"];
    //TODO: Add proper handling and feedback
    $.ajax({
      type: "POST",
      url: "https://localhost:5000/api/v1.0.0/topic",
      data: JSON.stringify({ name: topic.value }),
      dataType: "json",
      contentType: "application/json",
      success: function(data) {
        alert("Success Added");
      },
      error: function(data) {
        alert("Error");
      }
    });
  });
};
