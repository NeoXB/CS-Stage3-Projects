function showPage(page, pageButton) {
    let allPages = document.getElementsByTagName("section");
    let allButtons = document.getElementsByClassName("button");
    let allPagesArr = Array.from(allPages);
    let allButtonsArr = Array.from(allButtons);
    allPagesArr.forEach(pageName => pageName.style.display = "none");
    allButtonsArr.forEach(button => button.style.background = "white");
    document.getElementById(page).style.display = "block";
    document.getElementById(pageButton).style.backgroundColor = "royalblue";
}

function getStaff(id) {
    let url1 = encodeURIComponent("https://unidirectory.auckland.ac.nz/rest/search?orgFilter=MATHS")
    let fetchUrl1 = "http://redsox.uoa.auckland.ac.nz/cors/CorsProxyService.svc/proxy?url=" + url1;
    fetch(fetchUrl1, {
        method: "GET",
        headers: { "Accept": "application/json" }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        const staffPage = document.getElementById(id);
        staffPage.innerHTML = "";
        let staffList = data.list;
        if (staffList.length > 0) {
            staffList.forEach(staff => {
                let photo;
                if (!("imageId" in staff)) {
                    photo = "<img src='https://u.o0bc.com/avatars/stock/_no-user-image.gif' alt='Staff photo' id='staffPhoto'>"
                } else {
                    photo = "<img src='https://unidirectory.auckland.ac.nz/people/imageraw/" + staff.profileUrl[1] + "/" + staff.imageId + "/biggest' alt='Staff photo' id='staffPhoto'>";
                }
                let fullname;
                if (!("title" in staff)) {
                    fullname = "<div>" + staff.firstname + " " + staff.lastname + "</div>";
                } else {
                    fullname = "<div>" + staff.title + " " + staff.firstname + " " + staff.lastname + "</div>";
                }
                let jobtitle = "<div>" + staff.jobtitles[0] + "</div>";
                let email = "<a href='mailto:" + staff.emailAddresses[0] + "'><div id='email'>" + staff.emailAddresses[0] + "</div></a>";
                let mobileLink = "<a href='https://unidirectory.auckland.ac.nz/people/vcard/" + staff.profileUrl[1] + "'><div id='mobile'>Mobile users can tap here to add " + staff.firstname + " " + staff.lastname + "'s contact details to your phone!</div></a>";
                let url2 = encodeURIComponent("https://unidirectory.auckland.ac.nz/people/vcard/" + staff.profileUrl[1]);
                let fetchUrl2 = "http://redsox.uoa.auckland.ac.nz/cors/CorsProxyService.svc/proxy?url=" + url2;
                fetch(fetchUrl2, {
                    method: "GET",
                }).then((response) => {
                    if (response.ok) {
                        return response.text();
                    } else {
                        return 0;
                    }
                }).then((vcard) => {
                    if (vcard) {
                        let vcardList = vcard.split("\n");
                        let phone;
                        vcardList.forEach(key => {
                            if (key.substr(0, 3).toLocaleUpperCase() == "TEL") {
                                let phoneList = key.split(":");
                                phone = phoneList[1];
                            }
                        });
                        let phoneNo = "<a href='tel:" + phone + "'><div id='phone'>" + phone + "</div></a>";
                        staffPage.innerHTML += "<div class='staffProfile'>" + photo + fullname + jobtitle + email + phoneNo + mobileLink + "</div>";
                    } else {
                        staffPage.innerHTML += "<div class='staffProfile'>" + photo + fullname + jobtitle + email + "</div>";
                    }
                }).catch(error => console.error("Request failed: ", error));
            });
        } else {
            staffPage.innerHTML += "<div>The employment process is still in progress!</div>";
        }
    }).catch(error => console.error("Request failed: ", error));
}

function getTimetable(catalogNo) {
    let url = ("https://api.test.auckland.ac.nz/service/classes/v1/classes?year=2020&subject=MATHS&size=500&catalogNbr=" + catalogNo);
    fetch(url, {
        method: "GET",
        headers: { "Accept": "application/json" }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        const coursePage = document.getElementById("allCourse");
        coursePage.innerHTML = "";
        let timetableList = data.data;
        if (timetableList.length > 0) {
            let i = 1;
            timetableList.forEach(time => {
                let heading = "<div><strong>" + time.acadOrg + " " + catalogNo + " Timetable " + i + "</strong></div>";
                let campus = "<div>Campus location: " + time.campus + "</div>";
                let classNo = "<div>Class number: " + time.classNbr + "</div>";
                let date = "<div>Active from " + time.startDate + " to " + time.endDate + "</div>";
                let enrol = "<div>" + time.enrolTotal + " student(s) enrolled (max: " + time.enrolCap + ")</div>";
                if (time.meetingPatterns.length != 0) {
                    let table = "<table id='table'>";
                    table += "<tr><th>Meeting Number</th><th>Start Date</th><th>End Date</th><th>Start Time</th><th>End Time</th><th>Location</th><th>Day of Week</th></tr>";
                    let meeting = time.meetingPatterns;
                    meeting.forEach(meet => {
                        table += "<tr><td>" + meet.meetingNumber + "</td><td>" + meet.startDate + "</td><td>" + meet.endDate + "</td><td>" + meet.startTime + "</td><td>" + meet.endTime + "</td><td>" + meet.location + "</td><td>" + meet.daysOfWeek + "</td></tr>";
                    });
                    table += "</table>";
                    coursePage.innerHTML += "<div id='viewTimetable'>" + heading + "<br>" + campus + "<br>" + classNo + "<br>" + date + "<br>" + enrol + "<br>" + table + "</div>";
                } else {
                    coursePage.innerHTML += "<div id='viewTimetable'>" + heading + "<br>" + campus + "<br>" + classNo + "<br>" + date + "<br>" + enrol + "</div>";
                }
                i++;
            });
        } else {
            coursePage.innerHTML += "<div>Timetable is currently not available.</div>";
        }
    }).catch(error => console.error("Request failed: ", error));
}

function getCourse(id) {
    fetch("https://api.test.auckland.ac.nz/service/courses/v2/courses?subject=MATHS&year=2020&size=500", {
        method: "GET",
        headers: { "Accept": "application/json" }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        const coursePage = document.getElementById(id);
        coursePage.innerHTML = "";
        let courseList = data.data;
        if (courseList.length > 0) {
            courseList.forEach(course => {
                let courseName = "<div><strong>" + course.subject + " " + course.catalogNbr + " - " + course.titleLong + "</strong></div>";
                let point = "<div>Points offered: " + course.unitsAcadProg + "</div>";
                let courseNo = String(course.catalogNbr);
                let timetableButton = '<button id="timetableButton" onclick="getTimetable(\'' + courseNo + '\')">View Timetable</button>';
                let courseDesc;
                let requirement;
                if ("description" in course) {
                    courseDesc = "<div>" + course.description + "</div>";
                    if ("rqrmntDescr" in course) {
                        requirement = "<div>" + course.rqrmntDescr + "</div>";
                        coursePage.innerHTML += "<div class='viewCourse'>" + courseName + "<br/>" + courseDesc + "<br/>" + requirement + "<br/>" + point + "<br/>" + timetableButton + "</div>";
                    } else {
                        coursePage.innerHTML += "<div class='viewCourse'>" + courseName + "<br/>" + courseDesc + "<br/>" + point + "<br/>" + timetableButton + "</div>";
                    }
                } else {
                    if ("rqrmntDescr" in course) {
                        requirement = "<div>" + course.rqrmntDescr + "</div>";
                        coursePage.innerHTML += "<div class='viewCourse'>" + courseName + "<br/>" + requirement + "<br/>" + point + "<br/>" + timetableButton + "</div>";
                    } else {
                        coursePage.innerHTML += "<div class='viewCourse'>" + courseName + "<br/>" + point + "<br/>" + timetableButton + "</div>";
                    }
                }
            });
        } else {
            coursePage.innerHTML += "<div>There are no courses offered as for now.</div>";
        }
    }).catch(error => console.error("Request failed: ", error));
}

function getInfo(graph, data) {
    fetch("https://cws.auckland.ac.nz/qz20/Quiz2020ChartService.svc/g", {
        method: "GET",
    }).then((response) => {
        return response.text();
    }).then((matrix) => {
        let timetable = JSON.parse(matrix);
        // Create svg
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", timetable.length * 110);
        svg.setAttribute("height", timetable.length * 170);
        let symbol = document.createElementNS("http://www.w3.org/2000/svg", "symbol");
        symbol.setAttribute("id", "M");
        symbol.setAttribute("viewBox", "-53 -3 606 506");
        symbol.setAttribute("width", "100");
        symbol.setAttribute("height", "100");
        // Create mask
        let mask = document.createElementNS("http://www.w3.org/2000/svg", "mask");
        mask.setAttribute("id", "circleMask");
        let circleMask1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleMask1.setAttribute("cx", "250");
        circleMask1.setAttribute("cy", "250");
        circleMask1.setAttribute("r", "500");
        circleMask1.setAttribute("fill", "white");
        let circleMask2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circleMask2.setAttribute("cx", "250");
        circleMask2.setAttribute("cy", "300");
        circleMask2.setAttribute("r", "121");
        mask.appendChild(circleMask1);
        mask.appendChild(circleMask2);
        // Create logo
        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M 31.2 426.2 A 252.55 252.55 0 1 1 468.8 426.2");
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "black");
        path.setAttribute("stroke-width", "61");
        path.setAttribute("stroke-linecap", "round");
        let line1 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line1.setAttribute("x1", "36");
        line1.setAttribute("y1", "86");
        line1.setAttribute("x2", "56");
        line1.setAttribute("y2", "106");
        line1.setAttribute("stroke", "black");
        line1.setAttribute("stroke-width", "61");
        line1.setAttribute("stroke-linecap", "round");
        let line2 = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line2.setAttribute("x1", "464");
        line2.setAttribute("y1", "86");
        line2.setAttribute("x2", "444");
        line2.setAttribute("y2", "106");
        line2.setAttribute("stroke", "black");
        line2.setAttribute("stroke-width", "61");
        line2.setAttribute("stroke-linecap", "round");
        let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "219.5");
        rect.setAttribute("y", "50");
        rect.setAttribute("width", "61");
        rect.setAttribute("height", "100");
        let circ1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ1.setAttribute("cx", "250");
        circ1.setAttribute("cy", "300");
        circ1.setAttribute("r", "182");
        circ1.setAttribute("mask", "url(#circleMask)");
        let circ2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ2.setAttribute("cx", "250");
        circ2.setAttribute("cy", "300");
        circ2.setAttribute("r", "30.4");
        let circ3 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circ3.setAttribute("cx", "257.5");
        circ3.setAttribute("cy", "292.5");
        circ3.setAttribute("r", "12.6");
        circ3.setAttribute("fill", "white");
        // Append everything
        symbol.appendChild(mask);
        symbol.appendChild(path);
        symbol.appendChild(line1);
        symbol.appendChild(line2);
        symbol.appendChild(rect);
        symbol.appendChild(circ1);
        symbol.appendChild(circ2);
        symbol.appendChild(circ3);
        svg.appendChild(symbol);
        // Use logo
        i = 1;
        x = 10;
        timetable.forEach(num => {
            x += 50;
            y = 100;
            let remainder = num % 10;
            let whole = parseInt((num / 10), 10);
            let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
            text.setAttribute("x", x);
            text.setAttribute("y", y)
            text.setAttribute("text-anchor", "middle");
            text.setAttribute("font-size", "110");
            text.textContent = i;
            svg.appendChild(text);
            y += 20;
            x -= 50;
            n = 0
            while (n < whole) {
                let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                use.setAttribute("href", "#M");
                use.setAttribute("x", x);
                use.setAttribute("y", y);
                svg.appendChild(use);
                y += 100;
                n++;
            }
            if (remainder != 0) {
                let use = document.createElementNS("http://www.w3.org/2000/svg", "use");
                use.setAttribute("href", "#M");
                use.setAttribute("x", x);
                use.setAttribute("y", y);
                svg.appendChild(use);
                let rectClip = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rectClip.setAttribute("x", x);
                y += 10 + (remainder * 8);
                rectClip.setAttribute("y", y);
                rectClip.setAttribute("width", "100");
                rectClip.setAttribute("height", 100 - (10 + (remainder * 8)));
                rectClip.setAttribute("fill", "paleturquoise");
                svg.appendChild(rectClip);
            }
            i++;
            x += 100;
        });
        const graphDiv = document.getElementById(graph);
        graphDiv.innerHTML = "";
        graphDiv.appendChild(svg);
        const dataDiv = document.getElementById(data);
        dataDiv.innerHTML = "";
        dataDiv.innerHTML += matrix;
    }).catch(error => console.error("Request failed: ", error));
}