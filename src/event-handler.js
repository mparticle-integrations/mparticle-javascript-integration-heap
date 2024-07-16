/*
A non-ecommerce event has the following schema:

{
    DeviceId: "a80eea1c-57f5-4f84-815e-06fe971b6ef2",
    EventAttributes: {test: "Error", t: 'stack trace in string form'},
    EventName: "Error",
    MPID: "123123123123",
    UserAttributes: {userAttr1: 'value1', userAttr2: 'value2'},
    UserIdentities: [{Identity: 'email@gmail.com', Type: 7}]
    User Identity Types can be found here:
}

*/

function EventHandler(common) {
    this.common = common || {};
}
EventHandler.prototype.logEvent = function (event) {
    var ignoredEvents = ['click', 'change', 'submit'];

    if (ignoredEvents.includes(event.EventName.toLowerCase())) {
        return;
    }

    window.heap.track(event.EventName, event.EventAttributes);
};

module.exports = EventHandler;
