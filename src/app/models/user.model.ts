export interface IUser {
    userId: string;
    userEmail: string;
    userPassword: string;
    userPhone: string;
    userprofile?:{
        firstName?: string;
        lastName?: string;
        userPic?: string;
    };
    settings?:{
        radius?:number;
        calcMethod?:string;
        school?:string;
        lastLocation?:[]
    };
    role:{
        roleName: string;
        roleDescription:string;
    }
}