

const bcrypt = require('bcryptjs');

const { Option, Role, RolePermission, User, PaymentInfo, Person, Broker, Client, Size, Company } = require('../models');
const Permission = require('../enums/permission.enum');
const SizeTypeEnum = require('../enums/sizy-type.enum');


const seedDatabase = async () => {
    await cleanDatabase();

    await seedOptions();
    const { adminRole, secretariaRole, compradorRole } = await seedRoles();
    await seedPermissions();

    await seedCompanies();
    await seedSizes();

    // Encriptar contraseña
    const salt = bcrypt.genSaltSync();

    // --- Step 1: Create one Person and one User for each role ---
    // Admin User
    const adminPerson = await Person.create({
        photo: '',
        names: 'Admin',
        lastNames: 'User',
        identification: 'admin-001',
        birthDate: new Date('1990-01-01'),
        address: '123 Admin St',
        phone: '111-111-1111',
        mobilePhone: '222-222-2222',
        mobilePhone2: '',
        email: 'admin@example.com',
        emergencyContactName: 'Admin Emergency',
        emergencyContactPhone: '333-333-3333',
        paymentInfos: [] // Adjust or remove as needed
    });
    const adminUser = await User.create({
        person: adminPerson._id,
        username: 'admin',
        email: 'admin@example.com',
        password: bcrypt.hashSync('asdf1234', salt),
        roles: [adminRole._id]
    });

    // Secretaria User
    const secretariaPerson = await Person.create({
        photo: '',
        names: 'Secretaria',
        lastNames: 'User',
        identification: 'secretaria-001',
        birthDate: new Date('1991-01-01'),
        address: '456 Secretaria Ave',
        phone: '444-444-4444',
        mobilePhone: '555-555-5555',
        mobilePhone2: '',
        email: 'secretaria@example.com',
        emergencyContactName: 'Secretaria Emergency',
        emergencyContactPhone: '666-666-6666',
        paymentInfos: []
    });
    const secretariaUser = await User.create({
        person: secretariaPerson._id,
        username: 'secre',
        email: 'secretaria@example.com',
        password: bcrypt.hashSync('asdf1234', salt),
        roles: [secretariaRole._id]
    });

    // Comprador User
    const compradorPerson = await Person.create({
        photo: '',
        names: 'Comprador',
        lastNames: 'User',
        identification: 'comprador-001',
        birthDate: new Date('1992-01-01'),
        address: '789 Comprador Rd',
        phone: '777-777-7777',
        mobilePhone: '888-888-8888',
        mobilePhone2: '',
        email: 'comprador@example.com',
        emergencyContactName: 'Comprador Emergency',
        emergencyContactPhone: '999-999-9999',
        paymentInfos: []
    });
    const compradorUser = await User.create({
        person: compradorPerson._id,
        username: 'buyer',
        email: 'comprador@example.com',
        password: bcrypt.hashSync('asdf1234', salt),
        roles: [compradorRole._id]
    });

    console.log('Seeding process completed');
};

const cleanDatabase = async () => {
    console.log('Cleaning database...');
    await Broker.deleteMany({});
    await Client.deleteMany({});
    await Option.deleteMany({});
    await PaymentInfo.deleteMany({});
    await Person.deleteMany({});
    await Role.deleteMany({});
    await RolePermission.deleteMany({});
    await User.deleteMany({});
    await Size.deleteMany({});
    await Company.deleteMany({});
    console.log('Cleaning completed');
};

const seedOptions = async () => {
    try {
        // Principal 
        const optionPrincipal = await Option.create({
            name: 'Principal',
            route: '/home',
            icon: 'element-11',
        });

        const optionPerfilPersonal = await Option.create({
            name: 'Perfil Personal',
            icon: 'profile-circle',
        });

        // Perfil Personal
        const optionMiPerfil = await Option.create({
            name: 'Mi Perfil',
            route: 'personal-profile/my-profile',
            parentOption: optionPerfilPersonal,
        });

        const optionUsers = await Option.create({
            name: 'Usuarios',
            route: 'personal-profile/users',
            parentOption: optionPerfilPersonal,
        });

        const optionBroker = await Option.create({
            name: 'Brokers',
            route: 'personal-profile/brokers',
            parentOption: optionPerfilPersonal,
        });

        // Clientes 
        const optionClientes = await Option.create({
            name: 'Clientes',
            route: '/clients',
            icon: 'people',
        });


    } catch (error) {
        throw new Error('Error seeding options: ' + error.message);
    }
}

const seedRoles = async () => {
    try {

        const adminRole = await Role.create({
            name: 'Admin',
        });

        const secretariaRole = await Role.create({
            name: 'Secretaria',
        });

        const compradorRole = await Role.create({
            name: 'Comprador',
        });

        return {
            adminRole, secretariaRole, compradorRole
        };
    } catch (error) {
        throw new Error('Error seeding roles: ' + error.message);
    }
};

const seedPermissions = async (options, roles) => {
    try {
        const roles = await Role.find();

        // Opción: Principal
        const optionPrincipal = await Option.findOne({ name: 'Principal' });
        roles.forEach(async (role) => {
            await RolePermission.create({
                role,
                option: optionPrincipal,
                actions: [Permission.VIEW],
            });
        });

        // Opción: Perfil Personal
        const optionPerfilPersonal = await Option.findOne({ name: 'Perfil Personal' });
        roles.forEach(async (role) => {
            await RolePermission.create({
                role,
                option: optionPerfilPersonal,
                actions: [Permission.VIEW],
            });

            const optionMiPerfil = await Option.findOne({ name: 'Mi Perfil' });
            await RolePermission.create({
                role,
                option: optionMiPerfil,
                actions: [Permission.VIEW, Permission.EDIT],
            });

            const optionBrokers = await Option.findOne({ name: 'Brokers' });
            switch (role.name) {
                case 'Admin':
                    await RolePermission.create({
                        role,
                        option: optionBrokers,
                        actions: [Permission.VIEW, Permission.EDIT, Permission.DELETE],
                    });
                    break;
                case 'Secretaria':
                    await RolePermission.create({
                        role,
                        option: optionBrokers,
                        actions: [Permission.VIEW, Permission.EDIT],
                    });
                    break;
                case 'Comprador':
                    await RolePermission.create({
                        role,
                        option: optionBrokers,
                        actions: [Permission.VIEW, Permission.ADD],
                    });
                    break;
            }

            const optionUsers = await Option.findOne({ name: 'Usuarios' });
            switch (role.name) {
                case 'Admin':
                    await RolePermission.create({
                        role,
                        option: optionUsers,
                        actions: [Permission.VIEW, Permission.EDIT, Permission.ADD, Permission.DELETE],
                    });
                    break;
                case 'Secretaria':
                    await RolePermission.create({
                        role,
                        option: optionUsers,
                        actions: [Permission.VIEW, Permission.EDIT, Permission.ADD],
                    });
                    break;
                case 'Comprador':
                    await RolePermission.create({
                        role,
                        option: optionUsers,
                        actions: [],
                    });
                    break;
            }
        });

        // Opción: Clientes
        const optionClientes = await Option.findOne({ name: 'Clientes' });
        roles.forEach(async (role) => {
            switch (role.name) {
                case 'Admin':
                    await RolePermission.create({
                        role,
                        option: optionClientes,
                        actions: [Permission.VIEW, Permission.EDIT, Permission.ADD, Permission.DELETE],
                    });
                    break;
                case 'Secretaria':
                    await RolePermission.create({
                        role,
                        option: optionClientes,
                        actions: [Permission.VIEW, Permission.EDIT, Permission.ADD],
                    });
                    break;
                case 'Comprador':
                    await RolePermission.create({
                        role,
                        option: optionClientes,
                        actions: [Permission.VIEW, Permission.ADD],
                    });
                    break;
            }
        });
    } catch (error) {
        throw new Error('Error seeding permissions: ' + error.message);
    }
};

const seedCompanies = async () => {
    try {
        // EDPACIFIC 
        const company1 = await Company.create({
            name: 'Edpacific',
        });

        const company2 = await Company.create({
            name: 'Prodex',
        });
    } catch (error) {
        throw new Error('Error seeding companies: ' + error.message);
    }
}

const seedSizes = async () => {
    try {
        // WHOLE 
        const size1 = await Size.create({
            size: '20/30',
            type: SizeTypeEnum.WHOLE
        });

        const size2 = await Size.create({
            size: '30/40',
            type: SizeTypeEnum.WHOLE
        });

        const size3 = await Size.create({
            size: '40/50',
            type: SizeTypeEnum.WHOLE
        });

        const size4 = await Size.create({
            size: '50/60',
            type: SizeTypeEnum.WHOLE
        });

        const size5 = await Size.create({
            size: '60/70',
            type: SizeTypeEnum.WHOLE
        });

        const size6 = await Size.create({
            size: '70/80',
            type: SizeTypeEnum.WHOLE
        });

        const size7 = await Size.create({
            size: '80/100',
            type: SizeTypeEnum.WHOLE
        });

        const size8 = await Size.create({
            size: '100/120',
            type: SizeTypeEnum.WHOLE
        });

        // HEADLESS 
        const size9 = await Size.create({
            size: '16/20',
            type: SizeTypeEnum.HEADLESS
        });

        const size10 = await Size.create({
            size: '21/25',
            type: SizeTypeEnum.HEADLESS
        });

        const size11 = await Size.create({
            size: '26/30',
            type: SizeTypeEnum.HEADLESS
        });

        const size12 = await Size.create({
            size: '31/35',
            type: SizeTypeEnum.HEADLESS
        });

        const size13 = await Size.create({
            size: '36/40',
            type: SizeTypeEnum.HEADLESS
        });

        const size14 = await Size.create({
            size: '41/50',
            type: SizeTypeEnum.HEADLESS
        });

        const size15 = await Size.create({
            size: '51/60',
            type: SizeTypeEnum.HEADLESS
        });

        const size16 = await Size.create({
            size: '61/70',
            type: SizeTypeEnum.HEADLESS
        });

        const size17 = await Size.create({
            size: '71/90',
            type: SizeTypeEnum.HEADLESS
        });

        const size18 = await Size.create({
            size: '91/110',
            type: SizeTypeEnum.HEADLESS
        });

        const size19 = await Size.create({
            size: '110/130',
            type: SizeTypeEnum.HEADLESS
        });
    } catch (error) {
        throw new Error('Error seeding sizes: ' + error.message);
    }
}

module.exports = {
    seedDatabase
};
