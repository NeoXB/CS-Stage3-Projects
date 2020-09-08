function showPage(page, pageButton) {
    let allPages = document.getElementsByTagName("section");
    let allButtons = document.getElementsByClassName("button");
    for (let pageName of allPages) {
        pageName.style.display = "none";
    }
    for (let button of allButtons) {
        button.style.color = "black";
        button.style.backgroundColor = "white";
    }
    document.getElementById("search").value = "";
    document.getElementById(page).style.display = "block";
    document.getElementById(pageButton).style.color = "black";
    document.getElementById(pageButton).style.backgroundColor = "lightgreen";
}

function getProduct(id) {
    fetch("http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/items", {
        method: "GET",
        headers: { "Accept": "application/json" }
    }).then((response) => {
        return response.json();
    }).then((products) => {
        const productList = document.getElementById(id);
        productList.innerHTML = "";
        if (products.length > 0) {
            for (let item of products) {
                let productPic = "<img src='http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/itemimg?id=" + item.ItemId + "' alt='Product picture' id='productPic'>";
                let title = "<div>" + item.Title + "</div>";
                let origin = "<div>" + "Made in " + item.Origin + "</div>";
                let price = "<div>" + "&dollar;" + item.Price + "</div>";
                const buyButton = "<button id='buyButton'>&#128722; BUY</button>";
                productList.innerHTML += "<div class='itemFormat'>" + productPic + title + origin + price + buyButton + "</div>";
            }
        } else {
            productList.innerHTML += "<div>Sorry, we do not supply that product &#128591;</div>";
        }
    }).catch(error => console.error("Request failed: ", error));
}

function getSearch(id, value) {
    const url = "http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/search?term=" + value;
    fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
    }).then((response) => {
        return response.json();
    }).then((products) => {
        const productList = document.getElementById(id);
        productList.innerHTML = "";
        if (products.length > 0) {
            for (let item of products) {
                let productPic = "<img src='http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/itemimg?id=" + item.ItemId + "' alt='Product picture' id='productPic'>";
                let title = "<div>" + item.Title + "</div>";
                let origin = "<div>" + "Made in " + item.Origin + "</div>";
                let price = "<div>" + "&dollar;" + item.Price + "</div>";
                const buyButton = "<button id='buyButton'>&#128722; BUY</button>";
                productList.innerHTML += "<div class='itemFormat'>" + productPic + title + origin + price + buyButton + "</div>";
            }
        } else {
            productList.innerHTML += "<div>Sorry, we do not supply that product &#128591;</div>";
        }
    }).catch(error => console.error("Request failed: ", error));
}

function getLocation(id) {
    fetch("http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/vcard", {
        method: "GET",
    }).then((response) => {
        return response.text();
    }).then((vcard) => {
        let vcardList = vcard.split("\n");
        let phone, road, city, country, email;
        for (let key of vcardList) {
            if (key.substr(0, 3).toLocaleUpperCase() == "TEL") {
                let phoneList = key.split(":");
                phone = phoneList[1];
            } else if (key.substr(0, 3).toLocaleUpperCase() == "ADR") {
                let addressList = key.split(":");
                let newAddressList = addressList[1].split(";");
                road = newAddressList[2];
                city = newAddressList[3];
                country = newAddressList[4];
            } else if (key.substr(0, 5).toLocaleUpperCase() == "EMAIL") {
                let emailList = key.split(":");
                email = emailList[1];
            }
        }
        const locationPage = document.getElementById(id);
        locationPage.innerHTML = "";
        let contactUs = "<div id='contactUs'>Contact Us!</div>";
        let phoneLink = "<a href='tel:" + phone + "'><div id='phone'>&#128222; " + phone + "</div></a>";
        let emailLink = "<a href='mailto:" + email + "'><div id='email'>&#128231; " + email + "</div></a>";
        let addressText = "<p><strong>Our Address:</strong><br>" + road + "<br>" + city + "<br>" + country + "</p>";
        let addressLink = "<a href='http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/vcard'><div id='address'>&#128506; Add us to your address book by clicking here!</div></a>";
        let mobileLink = "<a href='http://redsox.uoa.auckland.ac.nz/ds/mecard.svg'><div id='qrcode'>&#128241; Mobile users can tap here to scan our QR Code to add us!</div></a>";
        locationPage.innerHTML += "<div class='locationFormat'>" + contactUs + phoneLink + emailLink + addressText + addressLink + mobileLink + "</div>";
    }).catch(error => console.error("Request failed: ", error));
}

function getNews(id) {
    fetch("http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/news", {
        method: "GET",
        headers: { "Accept": "application/json" }
    }).then((response) => {
        return response.json();
    }).then((news) => {
        const newsList = document.getElementById(id);
        newsList.innerHTML = "";
        for (let article of news) {
            let newsPic = "<img src='" + article.enclosureField.urlField + "' alt='Article picture' id='newsPic'>";
            let title = "<div id='title'>" + article.titleField + "</div>";
            let link = "<a href='" + article.linkField + "'>" + title + "</a>";
            let date = "<div id='date'>" + article.pubDateField + "</div>";
            let desc = "<div>" + article.descriptionField + "</div>";
            newsList.innerHTML += "<div class='newsFormat'>" + newsPic + link + date + desc + "</div>";
        }
    }).catch(error => console.error("Request failed: ", error));
}

function postComment() {
    const name = document.getElementById("name");
    const comment = document.getElementById("comment");
    if (name.value == "") {
        name.value = "&#129302;";
    }
    const url = "http://redsox.uoa.auckland.ac.nz/ds/DairyService.svc/comment?name=" + name.value;
    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment.value)
    }).then(response => {
        return response.json();
    }).then(() => {
        name.value = "";
        comment.value = "";
        document.getElementById('allComments').src = document.getElementById('allComments').src;
    }).catch(error => console.error("Request failed: ", error));
}