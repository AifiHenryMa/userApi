// 养成良好的编程规范：
// 1. 我们使用小驼峰式命名法（lower camel case）作为所有变量和属性的命名规则
// 2. JavaScript中单引号（ ' ）和双引号（ " ）没有任何语义区别，两者都是可用的。我们建议一律统一为单引号
// 3. 约定回调函数的第一个参数是错误对象err
// 4. 尽量将所有的成员函数通过原型定义，将属性在构造函数内定义，然后对构造函数使用new关键字创建对象
// 绝对不要把属性作为原型定义，因为当要定义的属性是一个对象的时候，不同实例中的属性会指向同一地址

var mysql = require('mysql');
// JavaScript中没有类这个概念，所以用构造函数来描述类似于C++中类的定义
// 内部只定义成员变量，成员函数全部在外面用原型定义
function userApi() {
    var _this = this; // 把this保存下来，以后用_this代替this，这样就不会被this弄晕了
    var dbConfig = {  // 数据库的配置信息
        host: 'localhost',
        user: 'root',
        password: 'root',
        port: '3306',
        database: 'aifi'
    };
    _this.pool = mysql.createPool(dbConfig); // 创建连接池
};

// 定义接口函数register
userApi.prototype.register = function (username, password, callback) {  // 传入三个参数 用户名；密码；回调函数
    var _this = this;
    // 用来判断用户名是否存在
    var addSql1 = 'SELECT * FROM user where user_name = ?';
    var addSqlParams1 = [username];

    // 用来插入新用户记录
    var addSql2 = 'INSERT INTO user(user_name,password) VALUES(?,?)';
    var addSqlParams2 = [username, password];
    /* 进行连接 */
    _this.pool.getConnection(function (err, conn) {
        if (err) {   // 连接失败
            throw err;
            // 时间驱动回调
            callback(err, null, null);

        }
        else {     // 连接成功的话查询用户是否存在
            conn.query(addSql1, addSqlParams1, function (err, results, fields) {
                if (err) {  // 查询失败
                    throw err;
                    // 事件驱动回调  
                    callback(err, null, null);
                }
                else if (results.length !== 0) {  // 查询到相同的用户名                       
                    console.log('您想使用的用户名已经存在，请试试其他的用户名！');
                    // 释放连接  
                    conn.release();
                    // 事件驱动回调  
                    callback(err, results, fields);
                }
                else {   // 没有查询到相同的用户名
                    conn.query(addSql2, addSqlParams2, function (err, results, fields) {
                        if (err) {
                            throw err;
                            // 事件驱动回调  
                            callback(err, null, null);
                        }
                        else {
                            console.log('注册新用户成功！');
                            // 释放连接  
                            conn.release();
                            // 事件驱动回调  
                            callback(err, results, fields);
                        }

                    });
                }
            });

        }
    });
};

// 定义接口函数logIn
userApi.prototype.logIn = function (username, password, callback) {  // 传入三个参数 用户名；密码；回调函数
    var _this = this;
    // 用来判断用户名是否存在 or 用户名和密码是否匹配
    var addSql = 'SELECT * FROM user where user_name = ?';
    var addSqlParams = [username];

    // 登录成功 修改状态标志
    var modSql = 'UPDATE user SET status = ? WHERE user_name = ?';
    var modSqlParams = [1, username];
    /* 进行连接 */
    _this.pool.getConnection(function (err, conn) {
        if (err) {
            throw err;
            callback(err, null, null);
        }
        else {
            conn.query(addSql, addSqlParams, function (err, results, fields) {
                if (err) {
                    throw err;
                    callback(err, null, null);
                }
                else if (results.length === 0) {               // 没查询到该用户名，也就是用户不存在                       
                    console.log('此用户名不存在！');
                    conn.release();
                    callback(err, results, fields);
                }
                else if (results[0].password === password) {  // 查询到的密码和用户传入的密码匹配
                    console.log('用户名和密码匹配！');
                    conn.query(modSql, modSqlParams, function (err, results, fields) {
                        if (err) {
                            throw err;
                            callback(err, null, null);
                        }
                        else {
                            console.log('登录成功！');
                            // 释放连接  
                            conn.release();
                            // 事件驱动回调  
                            callback(err, results, fields);
                        }
                    });
                }
                else {
                    console.log('用户名或者密码错误！');  // 查询到的密码和用户传人的密码不匹配
                    // 释放连接  
                    conn.release();
                    // 事件驱动回调  
                    callback(err, results, fields);
                }
            });
        }
    });
};

// 定义接口函数logOut
// 用户名和密码是否正确以及用户是否存在的逻辑应由前端完成
userApi.prototype.logOut = function (username, password, callback) {  // 传入三个参数 用户名；密码；回调函数
    var _this = this;
    // 登录成功 修改状态标志
    var modSql = 'UPDATE user SET status = ? WHERE user_name = ?';
    var modSqlParams = [0, username];
    /* 进行连接 */
    _this.pool.getConnection(function (err, conn) {
        if (err) {
            throw err;
            callback(err, null, null);
        }
        else {
            conn.query(modSql, modSqlParams, function (err, results, fields) {
                if (err) {
                    throw err;
                    callback(err, null, null);
                }
                else {
                    console.log('登出成功！');
                    // 释放连接  
                    conn.release();
                    // 事件驱动回调  
                    callback(err, results, fields);
                }
            });
        }
    });
};

module.exports = new userApi();  // 导出模块





