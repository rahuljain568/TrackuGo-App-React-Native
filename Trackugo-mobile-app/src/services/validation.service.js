module.exports = {
    signInValidation: {
        username: {
            required: true
        },
        password: {
            required: true
        }
    },
    signUpValidation: {
        profile_name: {
            required: true,
            regex: /^[a-z ]{2,}$/i,
            message: 'Profile name should contain alphabets & spaces only and atleast 2 chars long.'
        },
        username: {
            required: true,
            regex: /^[a-z0-9]{4,12}$/i,
            message: 'Username should be alphanumeric and 4 to 12 digits.'
        },
        password: {
            required: true,
            regex: /(.){6,}/,
            message: 'Password should contain minimum 6 characters.'
        },
        email: {
            required: true,
            regex: /\S+@\S+\.\S+/,
            message: 'Email is not valid.'
        },
        phone: {
            required: true,
            regex: /^[6-9][0-9]{9}$/i,
            message: 'Mobile number is not valid.'
        },
        address: {
            required: false,
            regex: /(.){10,}/,
            message: 'Address should contain minimum 10 characters.'
        }, 
    },
    forgotPasswordValidation: {
        email: {
            required: true,
            regex: /\S+@\S+\.\S+/,
            message: 'Email is not valid.'
        }
    },
    passwordValidation: {
        new_password: {
            required: true,
            regex: /(.){6,}/,
            message: 'Password should contain minimum 6 characters.'
        },
        confirm_password: {
            required: true,
            equals: 'new_password',
            message: 'Password should be same as new password.'
        }
    },
    parkingValidation: {
        location_name: {
            required: true,
            regex: /^[a-z ]{2,}$/i,
            message: 'Location name should contain alphabets & spaces only and atleast 2 chars long.'
        },
        remarks: {
            required: false,
            regex: /(.){5,}/,
            message: 'Remarks should contain minimum 5 characters.'
        }
    },
    geofenceValidation: {
        title: {
            required: true,
            regex: /^[a-z ]{2,}$/i,
            message: 'Location name should contain alphabets & spaces only and atleast 2 chars long.'
        },
        range: {
            required: true
        },
        remarks: {
            required: false,
            regex: /(.){5,}/,
            message: 'Remarks should contain minimum 5 characters.'
        }
    },
    deviceValidation: {
        device_name: {
            required: true
        },
        device_code: {
            required: true,
            regex: /^[A-Z0-9]{10,}$/i,
            message: 'Device code should contain minimum 10 characters & no spaces.'
        },
    },
    profileValidation: {
        profile_name: {
            required: true,
            regex: /^[A-Z\ ]{2,}$/i,
            message: 'Profile name should contains alphabets & space with minimum 2 characters.'
        },
        phone: {
            required: true,
            regex: /^[6-9][0-9]{9}$/i,
            message: 'Mobile number is not valid.'
        },
        email: {
            required: true,
            regex: /\S+@\S+\.\S+/,
            message: 'Email is not valid.'
        },
        address: {
            required: false,
            regex: /(.){10,}/,
            message: 'Address should contain minimum 10 characters.'
        }
    },
    locationValidation: {
        phone: {
            required: true,
            regex: /^[6-9][0-9]{9}$/i,
            message: 'Mobile number is not valid.'
        },
        remarks: {
            required: false,
            regex: /(.){5,}/,
            message: 'Remarks should contain minimum 5 characters.'
        }
    }
};