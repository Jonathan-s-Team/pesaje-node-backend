const { Schema, model } = require('mongoose');

const Permission = require('../../enums/permission.enum');

const RolePermissionSchema = Schema({

    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role'
    },
    option: {
        type: Schema.Types.ObjectId,
        ref: 'Option'
    },
    actions: [{
        type: String,
        enum: Permission
    }],
});

module.exports = model('RolePermission', RolePermissionSchema);