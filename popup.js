document.addEventListener(
  "DOMContentLoaded",
  () => {
    function createList() {
      chrome.storage.sync.get("companyNameList", function (info) {
        const CompaniesNamesList = info.companyNameList;

        if (!CompaniesNamesList) {
          chrome.storage.sync.set({ companyNameList: [] });
          return;
        }

        const companyNameListElement = document.getElementById(
          "companyNameList"
        );

        CompaniesNamesList.reverse();

        companyNameListElement.innerHTML = "";

        CompaniesNamesList.forEach(function (data, i) {
          const div = document.createElement("div");
          div.innerHTML += `<span rel="${i}" class="remove-btn"></span>
                            <span class="company-name">${data}</span>`;
          companyNameListElement.appendChild(div);
        });

        const BtnList = document.querySelectorAll(".remove-btn");
        BtnList.forEach((el) =>
          el.addEventListener("click", (event) => {
            const elIndex = Number(el.getAttribute("rel"));
            const newList = CompaniesNamesList.filter(
              (item, index) => index !== elIndex
            );

            newList.reverse();

            chrome.storage.sync.set({ companyNameList: newList });

            createList();
          })
        );
      });

      createListCall();
    }

    function createListCall() {
      chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, { message: "createListCall" });
      });
    }

    function addCompanyToList(inputValue) {
      chrome.storage.sync.get("companyNameList", function (info) {
        const companiesNames = info.companyNameList;

        if (companiesNames.includes(inputValue)) {
          document.getElementById("errorMessage").innerHTML =
            "Company already in list";
          return;
        } else {
          document.getElementById("errorMessage").innerHTML = "";

          companiesNames.push(inputValue);
          chrome.storage.sync.set({ companyNameList: companiesNames });

          document.getElementById("companyInput").value = "";
          createList();
        }
      });
    }

    createList();

    //add from input
    addCompanyBtn.onclick = function () {
      const companyInput = document.getElementById("companyInput");
      if (companyInput.value === "") return;
      addCompanyToList(companyInput.value);
    };

    companyInput.onkeydown = function (e) {
      if (e.key == "Enter") {
        addCompanyToList(e.target.value);
      }
    };

    //download JSON
    downloadBtn.onclick = function () {
      chrome.storage.sync.get("companyNameList", function (info) {
        let el = document.createElement("a");
        el.id = "download";
        el.download = "CompaniesNamesList.json";
        el.href = URL.createObjectURL(
          new Blob([JSON.stringify(info.companyNameList)])
        );
        el.click();
      });
    };

    //upload JSON
    document.getElementById("uploadJSON").onchange = function () {
      if (this.files[0].type === "application/json") {
        const file_to_read = this.files[0];
        const filerRead = new FileReader();

        filerRead.onload = function (e) {
          const content = e.target.result;
          const intern = JSON.parse(content);

          chrome.storage.sync.set({ companyNameList: intern });

          createList();
          document.getElementById("errorMessage").innerHTML = "";
        };
        filerRead.readAsText(file_to_read);
      } else {
        document.getElementById("errorMessage").innerHTML =
          "Only JSON format support!";
      }
    };

    //choose what action to do
    chrome.storage.sync.get("whatAction", function (info) {
      let whatAction = info.whatAction;

      if (!whatAction) {
        chrome.storage.sync.set({ whatAction: "nothing" });
        whatAction = "nothing";
      }

      document.getElementById(whatAction).checked = true;
    });

    document.querySelectorAll("input[name='whatAction']").forEach((input) => {
      input.addEventListener("change", () => {
        chrome.storage.sync.set({ whatAction: input.value });
        document.getElementById(input.value).checked = true;

        createListCall();
      });
    });
  },
  false
);
