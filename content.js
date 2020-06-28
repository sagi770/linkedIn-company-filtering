function updateListView() {
  chrome.storage.sync.get(["companyNameList", "whatAction"], function (info) {
    if (typeof info.companyNameList === "undefined") {
      info.companyNameList = [];
      chrome.storage.sync.set({ companyNameList: [] });
    }

    const CompaniesNamesList = info.companyNameList;
    const whatAction = info.whatAction;

    rollBackViewAndAddClickEvent();
    //nothing to do..
    if (whatAction === "nothing") return;

    const linkedinJobList = document.querySelectorAll(
      `.${getListClassSelector()} li`
    );

    for (let jobEl of linkedinJobList) {
      if (jobEl.querySelector(".job-card-container__company-name")) {
        const elementCompanyName = jobEl.querySelector(
          ".job-card-container__company-name"
        ).innerText;

        for (let CompaniesName of CompaniesNamesList) {
          if (
            elementCompanyName.toLowerCase() === CompaniesName.toLowerCase()
          ) {
            if (whatAction === "hide") {
              jobEl.classList.add("hidden");
            } else {
              //it's mark
              jobEl.style["background-color"] = "rgba(209, 200, 207, 0.62)";

              jobEl.classList.remove("hidden");
            }
          }
        }
      }
    }

    //if it's preview mode view
    if (
      document.getElementsByClassName("jobs-details-top-card__company-url")
        .length
    ) {
      //mark job preview: (for now i just mark it without hide content or show big message "company in the list"..)
      const previewCompanyName = document
        .getElementsByClassName("jobs-details-top-card__company-url")[0]
        .innerText.trim();

      if (CompaniesNamesList.includes(previewCompanyName)) {
        document.getElementsByClassName(
          "jobs-details-top-card__content-container"
        )[0].style["background-color"] = "rgba(209, 200, 207, 0.62)";
      } else {
        document.getElementsByClassName(
          "jobs-details-top-card__content-container"
        )[0].style["background-color"] = "";
      }
    }
  });
}

function getListClassSelector() {
  let selector = "jobs-search-results__list";

  //it's cube view
  if (document.getElementsByClassName("jobs-jymbii__list").length) {
    selector = "jobs-jymbii__list";
  }

  return selector;
}

function rollBackViewAndAddClickEvent() {
  const linkedinJobList = document.querySelectorAll(
    `.${getListClassSelector()} li`
  );

  for (let jobEl of linkedinJobList) {
    jobEl.style["background-color"] = "";
    jobEl.classList.remove("hidden");

    jobEl.addEventListener("click", (event) => {
      updateListView();
    });
  }
}

updateListView();

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "createListCall") {
    updateListView();
  }
});

window.addEventListener("load", function () {
  setTimeout(function () {
    updateListView();
  }, 1000);
});
