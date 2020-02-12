const onSubmitTopicForm = () => {
    $("#add-topic-form").submit(function(event) {
        event.preventDefault();
        const form = event.target;
        const topic = form.elements["topic_name"];

        if (!topic.value) {
            M.toast({
                html: "Please provide topic name",
                classes: "red",
            });
            return false;
        }

        M.toast({ html: "Updating...", classes: "purple" });
        $.ajax({
            type: "POST",
            url: "https://localhost:5000/api/v1.0.0/topic",
            data: JSON.stringify({ name: topic.value }),
            dataType: "json",
            contentType: "application/json",
            success: function(data) {
                M.toast({ html: "Topic added!", classes: "green" });
                $("#add-topic-form").reset();
                return false;
            },
            error: function(data) {
                M.toast({
                    html: "Error adding topic, please try again",
                    classes: "red"
                });
                $("#add-topic-form").reset();
                return false;
            }
        });
    });
};