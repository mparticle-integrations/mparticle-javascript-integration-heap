/*
The 'mParticleUser' is an object with methods get user Identities and set/get user attributes
Partners can determine what userIds are available to use in their SDK
Call mParticleUser.getUserIdentities() to return an object of userIdentities --> { userIdentities: {customerid: '1234', email: 'email@gmail.com'} }
For more identity types, see https://docs.mparticle.com/developers/sdk/web/idsync/#supported-identity-types
Call mParticleUser.getMPID() to get mParticle ID
For any additional methods, see https://docs.mparticle.com/developers/sdk/web/core-apidocs/classes/mParticle.Identity.getCurrentUser().html
*/

/*
identityApiRequest has the schema:
{
  userIdentities: {
    customerid: '123',
    email: 'abc'
  }
}
For more userIdentity types, see https://docs.mparticle.com/developers/sdk/web/idsync/#supported-identity-types
*/

function IdentityHandler(common) {
    this.common = common || {};
}
IdentityHandler.prototype.onUserIdentified = function(mParticleUser) {
    var identities = mParticleUser.getUserIdentities();
    var identity = identities[this.common.forwarderSettings.userIdentificationType];

    if (identity) {
        window.heap.identify(identity);
        console.log('identity handler', identity);
    }
};
IdentityHandler.prototype.onIdentifyComplete = function(
    mParticleUser,
    identityApiRequest
) {
    var identities = mParticleUser.getUserIdentities();
    var identity = identities[this.common.forwarderSettings.userIdentificationType];

    if (identity) {
        window.heap.identify(identity);
        console.log('identify complete', identity);
    }
};
IdentityHandler.prototype.onLoginComplete = function(
    mParticleUser,
    identityApiRequest
) {
    var identities = mParticleUser.getUserIdentities();
    var identity = identities[this.common.forwarderSettings.userIdentificationType];

    if (identity) {
        window.heap.identify(identity);
        console.log('login complete', identity);
    }
};
IdentityHandler.prototype.onLogoutComplete = function(
    mParticleUser,
    identityApiRequest
) {
    window.heap.resetIdentity();
    console.log("logout complete");
};
IdentityHandler.prototype.onModifyComplete = function(
    mParticleUser,
    identityApiRequest
) {};

/*  In previous versions of the mParticle web SDK, setting user identities on
    kits is only reachable via the onSetUserIdentity method below. We recommend
    filling out `onSetUserIdentity` for maximum compatibility
*/
IdentityHandler.prototype.onSetUserIdentity = function(
    forwarderSettings,
    id,
    type
) {
    if (forwarderSettings.userIdentificationType == type) {
        heap.identify(id);
    }
};

module.exports = IdentityHandler;
