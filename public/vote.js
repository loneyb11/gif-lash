const voteFrom = $("form.vote"); // The form that we submit when searching

voteForm.on("submit", (event) => {
  event.preventDefault();
  $.put("/api/vote", {
    name: selectionData.playerName,
    selection: selectionData.selection
  })
    .then((data) => {
      console.log("selection submited to database");
    })
    .catch(handleError);
});

// on socket recieves "round over/ start new round"

function nextround() {
  $.put("/api/newround", {
    name: req.user
  })
    .then((data) => {
      console.log("Cleared votes and selection");
    })
    .catch(handleError);
}
