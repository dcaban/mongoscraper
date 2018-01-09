

    var count = 0
    // Grab the articles as a json
    $(document).on("click", "#scrape", function() {
      event.preventDefault();
      console.log("working"); 
        $.get("/scrape", function(data) {
          results = data;
          count = results.count
          scrapeAgain(count)
        })
        $(".modal").addClass("is-active")
        
    });
    function scrapeAgain(x) {
        $.get("/scrape", function(data) {
            results = data;
            var newArticles= results.count-x;
            $("#newArticles").html("");
            $("#newArticles").append("We scraped NPR <i>All Tech Considered</i> to bring you ",newArticles, " new articles")
            prependArticles(newArticles, x);
          })
          $(".modal").addClass("is-active")
        
    };

    function prependArticles(a, x) {
        $.getJSON("/articles", function(data) {
  // For each one
  console.log(x)
  console.log(a)
  for (var i = x; i < data.length; i++) {
    // Display the apropos information on the page
    $("#newArticleCards").prepend("<div class='card'><div class='card-image'><figure class='image is-3x1'><img class='imgsize' src='"
    + data[i].image + "' alt='Placeholder image'><img class='imgbackground' src='"
    + data[i].image + "'></figure></div><div class='card-content'><p class='title' data-id='" 
    + data[i]._id + "'>" 
    + data[i].title + "</p><hr><p class='subtitle'>" + data[i].summary + 
    "</p><button id='saveButton' value='"+ data[i]._id +"'>SAVE ARTICLE</button></div>")
  }
});
    }


    $(document).on("click", ".modal-close, .modal-background", function() {
        $(".modal").removeClass("is-active");
    });



    $(document).on("click", ".saveButton" , function() {
        console.log("working");
        var blue = $(this).attr("value"); 
        console.log(blue); 
// When you click the save article button
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("value");
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/save/" + thisId,
      data: {
        // Value taken from title input
        saved: true
      }
    })
      // With that done
      .done(function(data) {
        // Log the response
        console.log(data);
      
      });
  });

    $(document).on("click", ".remove" , function() {
        console.log("remove almost working");
        var blue = $(this).attr("value");
        console.log(blue);
// When you click the save article button
        // Grab the id associated with the article from the submit button
        var thisId = $(this).attr("value");
        $("."+thisId+"").addClass("removed");

        // Run a POST request to change the note, using what's entered in the inputs
        $.ajax({
            method: "POST",
            url: "/remove/" + thisId,
            data: {
                // Value taken from title input
                saved: false
            }
        })
        // With that done
            .done(function(data) {
                // Log the response
                console.log("hello",data);

            });
    });
   