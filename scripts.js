let data = [];
let filtered = [];
let currentList = [];
let currentIndex = 0;

/* ================= FETCH DATA ================= */
fetch("/All Data 01.json")
    .then(res => res.json())
    .then(json => {
        data = json;
        filtered = data;

        loadFilters();
        updateKPIs();
        buildAreaSection();
    });

/* ================= HELPERS ================= */

function isValidWebsite(url){
    if(!url) return false;
    let val = url.toLowerCase().trim();
    return val !== "not available" && val !== "n/a" && val !== "na";
}

function getEmailDomain(email){
    if(!email || email === "Not Available") return "";
    return email.toLowerCase().split("@")[1] || "";
}

/* ================= FILTER LOAD ================= */

function loadFilters(){

    let nameSelect = document.getElementById("nameFilter");
    nameSelect.innerHTML = '<option value="">Select name</option>';

    data.forEach(d=>{
        let opt = document.createElement("option");
        opt.value = d.name;
        opt.textContent = d.name;
        nameSelect.appendChild(opt);
    });

    let types = [...new Set(data.map(d => d.type).filter(Boolean))];

    let typeSelect = document.getElementById("typeFilter");
    typeSelect.innerHTML = '<option value="">Select Type</option>';

    types.forEach(t=>{
        let opt = document.createElement("option");
        opt.value = t.trim();
        opt.textContent = t.trim();
        typeSelect.appendChild(opt);
    });
}

/* ================= FILTER APPLY ================= */

document.getElementById("nameFilter").addEventListener("change", function () {

    let selectedName = this.value;

    applyFilters();

    if (selectedName) {
        let selectedInstitute = data.find(d => d.name === selectedName);

        if (selectedInstitute) {
            currentList = filtered;
            viewDetails(data.indexOf(selectedInstitute));

            document.getElementById("details").scrollIntoView({
                behavior: "smooth"
            });
        }
    }
});
document.getElementById("typeFilter").addEventListener("change", applyFilters);
document.getElementById("domainFilter").addEventListener("change", applyFilters);
document.getElementById("emailFilter").addEventListener("change", applyFilters);

function applyFilters(){

    let name = document.getElementById("nameFilter").value;
    let type = document.getElementById("typeFilter").value;
    let domain = document.getElementById("domainFilter").value;
    let email = document.getElementById("emailFilter").value;

    filtered = data.filter(d => {

        let website = (d.website || "").toLowerCase();
        let emailVal = getEmailDomain(d.gmail);

        return (
            (!name || d.name === name) &&
            (!type || d.type.trim() === type) &&
            (!domain || (isValidWebsite(website) && website.includes(domain))) &&
            (!email || checkEmailType(emailVal, email))
        );

    });

    updateKPIs();
    buildAreaSection();
}

/* ================= EMAIL FILTER ================= */

function checkEmailType(domain, filter){

    if(filter === "gmail") return domain === "gmail.com";
    if(filter === "yahoo") return domain === "yahoo.com";
    if(filter === "rediff") return domain === "rediffmail.com";
    if(filter === "other") return domain && !["gmail.com","yahoo.com","rediffmail.com"].includes(domain);
    if(filter === "not") return !domain;

    return true;
}

/* ================= KPI ================= */

function updateKPIs(){

    document.getElementById("total").textContent = filtered.length;

    document.getElementById("school").textContent =
        filtered.filter(d => d.type.toLowerCase().includes("school")).length;

    document.getElementById("classes").textContent =
        filtered.filter(d => d.type.toLowerCase().includes("classes")).length;

    document.getElementById("institute").textContent =
        filtered.filter(d => d.type.toLowerCase().includes("institute")).length;

    document.getElementById("college").textContent =
        filtered.filter(d => d.type.toLowerCase().includes("college")).length;

    document.getElementById("academy").textContent =
        filtered.filter(d => d.type.toLowerCase().includes("academy")).length;

    document.getElementById("otherType").textContent =
        filtered.filter(d => {
            let t = d.type.toLowerCase();
            return !t.includes("school") && !t.includes("classes") &&
                   !t.includes("institute") && !t.includes("college") &&
                   !t.includes("academy");
        }).length;

    /* WEBSITE */

    document.getElementById("totalWebsites").textContent =
        filtered.filter(d => isValidWebsite(d.website)).length;

    document.getElementById("com").textContent =
        filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".com")).length;

    document.getElementById("in").textContent =
        filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".in") && !d.website.includes(".co.in")).length;

    document.getElementById("org").textContent =
        filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".org")).length;

    document.getElementById("coin").textContent =
        filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".co.in")).length;

    document.getElementById("io").textContent =
        filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".io")).length;

    document.getElementById("otherWebsite").textContent =
        filtered.filter(d =>
            isValidWebsite(d.website) &&
            !d.website.includes(".com") &&
            !d.website.includes(".in") &&
            !d.website.includes(".org") &&
            !d.website.includes(".co.in") &&
            !d.website.includes(".io")
        ).length;

    document.getElementById("websiteNo").textContent =
        filtered.filter(d => !isValidWebsite(d.website)).length;

    /* EMAIL */

    document.getElementById("totalEmail").textContent =
        filtered.filter(d => getEmailDomain(d.gmail)).length;

    document.getElementById("gmail").textContent =
        filtered.filter(d => getEmailDomain(d.gmail) === "gmail.com").length;

    document.getElementById("yahoo").textContent =
        filtered.filter(d => getEmailDomain(d.gmail) === "yahoo.com").length;

    document.getElementById("rediff").textContent =
        filtered.filter(d => getEmailDomain(d.gmail) === "rediffmail.com").length;

    document.getElementById("otherEmail").textContent =
        filtered.filter(d => {
            let domain = getEmailDomain(d.gmail);
            return domain &&
                !["gmail.com","yahoo.com","rediffmail.com"].includes(domain);
        }).length;
}

document.getElementById("site-search").addEventListener("keyup", function(e){
    if(e.key === "Enter"){
        e.preventDefault();
        runSearch(true);
    }
});

document.getElementById("site-search").addEventListener("input", function(){
    runSearch(false);
});

/* ================= AREA SECTION ================= */

function buildAreaSection(){

    let container = document.getElementById("cityCards");
    container.innerHTML = "";

    let areaCounts = {};

    filtered.forEach(d=>{
        let area = (d.area || "").trim();
        if(area){
            areaCounts[area] = (areaCounts[area] || 0) + 1;
        }
    });

    Object.entries(areaCounts)
        .sort((a,b)=>b[1]-a[1])
        .forEach(([area,count])=>{

            let card = document.createElement("div");
            card.className = "city-card";

            card.innerHTML = `
                <div>
                    <div class="city-name">${area}</div>
                    <div class="city-count">${count} Institutes</div>
                </div>
                <div>🏫</div>
            `;

            card.onclick = () => showAreaDetails(area);

            container.appendChild(card);
        });
}

/* ================= DETAILS ================= */

function showAreaDetails(area){

    let list = filtered.filter(d => d.area === area);

    renderDetails(list);

    // ✅ SCROLL TO DETAILS SECTION
    document.getElementById("details").scrollIntoView({
        behavior: "smooth"
    });

    // ✅ OPTIONAL: HIGHLIGHT EFFECT
    let box = document.getElementById("details");

    box.style.transition = "0.5s";
    box.style.background = "#d9f3eb";

    setTimeout(()=>{
        box.style.background = "#fff";
    },1000);
}

function renderDetails(list){

    currentList = list;   // ⭐ SAVE LIST

    let details = document.getElementById("details");

    if(list.length === 0){
        details.innerHTML = "<p>No data found</p>";
        return;
    }

    let html = "";

    list.forEach(d=>{
        html += `
        <div class="company-row">
            <span class="company-name">${d.name}</span>
            <button class="view-btn" onclick="viewDetails(${data.indexOf(d)})">
                View
            </button>
        </div>`;
    });

    details.innerHTML = html;
}

function viewDetails(index){
    
    currentIndex = index; 

    let d = data[index];

    document.getElementById("details").innerHTML = `
    <div class="full-details">

    <div class="nav-buttons">
            <button class="back-btn" onclick="goBack()">⬅ Back</button>

            <button class="nav-btn" onclick="prevItem()">⬅ Previous</button>
            <button class="nav-btn" onclick="nextItem()">Next ➡</button>
    </div>

    <div class="detail-row">
        <div class="detail-label">Name</div>
        <div class="detail-value">${d.name || "-"}</div>
    </div>

    <div class="detail-row">
        <div class="detail-label">Type</div>
        <div class="detail-value">${d.type || "-"}</div>
    </div>

    <div class="detail-row">
        <div class="detail-label">Area</div>
        <div class="detail-value">${d.area || "-"}</div>
    </div>

    <div class="detail-row">
        <div class="detail-label">Mobile</div>
        <div class="detail-value">
            ${d.mobile_no ? `<a href="tel:${d.mobile_no}">${d.mobile_no}</a>` : "-"}
        </div>
    </div>

    <div class="detail-row">
        <div class="detail-label">Email</div>
        <div class="detail-value">
            ${d.gmail ? `<a href="mailto:${d.gmail}">${d.gmail}</a>` : "-"}
        </div>
    </div>

    <div class="detail-row">
        <div class="detail-label">Website</div>
        <div class="detail-value">
            ${d.website && d.website !== "Not Available"
                ? `<a href="${d.website}" target="_blank">${d.website}</a>`
                : "-"}
        </div>
    </div>

    <div class="detail-row">
        <div class="detail-label">Address</div>
        <div class="detail-value">
            ${d.address
                ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.address)}" target="_blank">${d.address}</a>`
                : "-"}
        </div>
    </div>

</div>
`;
}
function goBack(){
    renderDetails(currentList);
}

function showDataList(type){

    let list = [];

    switch(type){

        case "total":
            list = filtered;
            break;

        case "school":
            list = filtered.filter(d => d.type.toLowerCase().includes("school"));
            break;

        case "classes":
            list = filtered.filter(d => d.type.toLowerCase().includes("classes"));
            break;

        case "institute":
            list = filtered.filter(d => d.type.toLowerCase().includes("institute"));
            break;

        case "college":
            list = filtered.filter(d => d.type.toLowerCase().includes("college"));
            break;

        case "academy":
            list = filtered.filter(d => d.type.toLowerCase().includes("academy"));
            break;

        case "otherType":
            list = filtered.filter(d => {
                let t = d.type.toLowerCase();
                return !t.includes("school") &&
                       !t.includes("classes") &&
                       !t.includes("institute") &&
                       !t.includes("college") &&
                       !t.includes("academy");
            });
            break;

        case "totalWebsites":
            list = filtered.filter(d => isValidWebsite(d.website));
            break;

        case "com":
            list = filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".com"));
            break;

        case "in":
            list = filtered.filter(d =>
                isValidWebsite(d.website) &&
                d.website.includes(".in") &&
                !d.website.includes(".co.in")
            );
            break;

        case "org":
            list = filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".org"));
            break;

        case "coin":
            list = filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".co.in"));
            break;

        case "io":
            list = filtered.filter(d => isValidWebsite(d.website) && d.website.includes(".io"));
            break;

        case "otherWebsite":
            list = filtered.filter(d =>
                isValidWebsite(d.website) &&
                !d.website.includes(".com") &&
                !d.website.includes(".in") &&
                !d.website.includes(".org") &&
                !d.website.includes(".co.in") &&
                !d.website.includes(".io")
            );
            break;

        case "websiteNo":
            list = filtered.filter(d => !isValidWebsite(d.website));
            break;

        case "totalEmail":
            list = filtered.filter(d => getEmailDomain(d.gmail));
            break;

        case "gmail":
            list = filtered.filter(d => getEmailDomain(d.gmail) === "gmail.com");
            break;

        case "yahoo":
            list = filtered.filter(d => getEmailDomain(d.gmail) === "yahoo.com");
            break;

        case "rediff":
            list = filtered.filter(d => getEmailDomain(d.gmail) === "rediffmail.com");
            break;

        case "otherEmail":
            list = filtered.filter(d => {
                let domain = getEmailDomain(d.gmail);
                return domain && !["gmail.com","yahoo.com","rediffmail.com"].includes(domain);
            });
            break;
    }

    renderDetails(list);

    document.getElementById("details").scrollIntoView({
        behavior: "smooth"
    });
}

function nextItem(){

    let list = currentList;

    let currentObj = data[currentIndex];
    let index = list.indexOf(currentObj);

    if(index < list.length - 1){
        viewDetails(data.indexOf(list[index + 1]));
    }
}

function prevItem(){

    let list = currentList;

    let currentObj = data[currentIndex];
    let index = list.indexOf(currentObj);

    if(index > 0){
        viewDetails(data.indexOf(list[index - 1]));
    }
}

function runSearch(shouldScroll = false){

    let input = document.getElementById("site-search").value.toLowerCase().trim();
    let details = document.getElementById("details");

    if(!input){
        renderDetails(filtered);
        return;
    }

    let result = filtered.filter(d =>
        (d.name || "").toLowerCase().includes(input) ||
        (d.area || "").toLowerCase().includes(input) ||
        (d.type || "").toLowerCase().includes(input)
    );

    if(result.length === 0){
        details.innerHTML = "<p>No results found</p>";
    } 
    else if(result.length === 1){
        currentList = result;
        viewDetails(data.indexOf(result[0]));
    } 
    else{
        renderDetails(result);
    }

    // ✅ ONLY SCROLL WHEN REQUIRED
    if(shouldScroll){
        details.scrollIntoView({ behavior: "smooth" });
    }
}