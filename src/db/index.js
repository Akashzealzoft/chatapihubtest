import { DataTypes,Sequelize } from 'sequelize';



//export const sequelize = new Sequelize("chatapihub","postgres","12345678", { dialect: "postgres" })
export const sequelize = new Sequelize('postgres://postgres:12345678@127.0.0.1:5432/chatapihub', { dialect: "postgres" })


export const connectDb = () => {
    sequelize.authenticate()
        .then((res) => {
            console.log(res)
        console.log( `\n 💓 Postgress sql Connected! Db\n`)
        })
    .catch((err) => {
      console.log(err);
    });
}
