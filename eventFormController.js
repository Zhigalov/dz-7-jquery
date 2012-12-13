$(function () {
    var myEvents = new Events([]);

    /**
     * Обработка формы с событием
     *   1. Извлечение данных о событии из формы
     *   2. Очитка формы от введенных данных
     *   3. Добавление события в список сохраненных
     *   4. Перересовка списка событий
     *
     * @return false для того чтобы не перезагружалась страница
     */
    function onSubmitEventForm() {
        "use strict";

        try {
            var event = parseEventForm();
            var errors = event.validate();
            if (errors.length == 0) {
                resetEventForm();
                myEvents = myEvents.add(event);
                rePaintEvents(myEvents);
            }
            else {
                setErrorMessage("Невозможно добавить событие, содержатся следующие ошибки:" + errors);
            }
        } catch (e) {
            console.log(e.message);
            console.log(e.stack);
        } finally {
            return false;
        }
    }


    /**
     * Загрузка сохраненных событий
     */
    function loadEvents() {
        "use strict";

        var localEvents = getFile("current-event.json", function (json) {
            myEvents.items = JSON
                .parse(json)
                .map(function (event) {
                    return new Event(event);
                });
            rePaintEvents(myEvents);
        });
    }

    /**
     * Сортировка и фильтрация списка сохраненных событий и их перерисовка
     */
    function showEventList() {
        "use strict";

        var events = myEvents.sortEventsBy($("#eventSortType").val());

        if ($("#lastEvents").is(":checked")) {
            events = events.findPastEvents();
        }

        if ($("#futureEvents").is(":checked")) {
            events = events.findFutureEvents();
        }

        var withPerson = $("#withPerson").val();
        if (withPerson != "") {
            events = events.findEventsWithPerson(withPerson);
        }

        var withoutPerson = $("#withoutPerson").val();
        if (withoutPerson != "") {
            events = events.findEventsWithoutPerson(withoutPerson);
        }
        
        events = events.findEventsWithRaitingMore($("#raitingMore").val());

        rePaintEvents(events);
    }

    /**
     * Очитка формы от введенных данных
     */
    function resetEventForm () {
        "use strict";

        $("#eventForm")[0].reset();
        deleteMembers();
        setErrorMessage("");
    }

    /**
     * Извлечение данных из формы
     * 
     * @return {Object|Event} Событие
     */
    function parseEventForm() {
        "use strict";

        var timeStart =
            new Date(
                Date.parse($("#eventDateStart").val() + "T" + $("#eventTimeStart").val()));
        var timeEnd = 
             new Date(
                Date.parse($("#eventDateEnd").val() + "T" + $("#eventTimeEnd").val()));
        var $members = $(".memberItem")
            .map(function() {
                return $(this).html();
            })
            .toArray();

        return new Event({
            "name": $("#eventName").val() || "<Без имени>",
            "address": $("#eventAddress").val() || "<Без адреса>",
            "timeStart": timeStart,
            "timeEnd": timeEnd,
            "member": $members,
            "raiting": +$("#eventRaiting").val() || 3
            });
    }

    /**
     * Перерисовка списка переданных событий
     * 
     * @param events список событий для отрисовки
     */
    function rePaintEvents(events) {
        "use strict";

        var $newContainer = $('<div />', {id: "myEvents"});
        
        events.items
            .map(eventHtml)
            .map(function (event) {
                $newContainer.append(event);
            });

        $("#myEvents").replaceWith($newContainer);
    }

    /**
     * Создание представления для одного события
     *
     * @return {String} html представление события
     */
    function eventHtml(event) {
        "use strict";

        var i, stars = "";
        for(i = 0; i < event.raiting ; i++) {
            stars += "*"
        }        
        var eventTmpl =
            "<div class='event'>" +
                "<div>${stars} \"${eventName}\" с ${timeStart} по ${timeEnd}</div>" +
                "<div>Адрес: ${eventAddress}</div>" +
                "<div>Участники: ${eventMember}</div>" +
            "</div>";

        return $.tmpl(eventTmpl, {
            stars: stars,
            eventName: event.name,
            timeStart: (event.timeStart == "Invalid Date") ? "Не указано" : new Date(event.timeStart).toUTCString(),
            timeEnd: (event.timeEnd == "Invalid Date") ? "Не указано" : new Date(event.timeEnd).toUTCString(),
            eventAddress: event.address,
            eventMember: event.member
        });
    }

    /**
     * Добавление участника события при нажатии на плюсик
     */
    function addMember() {
        "use strict";

        var $member = $("#eventMember").val();
        if ($member != "") {
            var $memberHTML = $("<div style='display:none' />"); 
            $memberHTML.html(
                    "<span class='inputTitle'>&nbsp;</span>" +
                    "<span class='memberItem'>" + $member +"</span>" +
                    "<img class='display:none' src='images/delete.jpg' alt='Удалить элемент' height='20' align='top'>");
            $memberHTML.on('click', deleteMember);
            $("#eventMembers").append($memberHTML);
            $memberHTML.slideDown();
            $("#eventMember").val('');
        }
    }

    /**
     * Удаление учатника события из отображаемого списка при нажатии на крестик
     */
    function deleteMember() {
        "use strict";

        $(this).parent().slideUp('slow', function() {
            $(this).remove();
        });
    }

    /**
     * Удаление всех участников события
     */
    function deleteMembers() {
        "use strict";

        $(".memberItem").parent().remove();
    }

    /**
     * Устанавливает сообщение об ошибке
     *
     * @param message сообщение об ошибке в форме
     */
    function setErrorMessage(message) {
        "use strict";

        $("#errorInForm").text(message);
    }
}