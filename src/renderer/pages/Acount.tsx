import React, { useState, useEffect } from "react";

const Acount = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const data = await window.electron.git.account.get();
            setUserData(data);
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        console.log(userData);
    }, [userData]);

    return (
        <div>
            <h1>IndexPage</h1>
            <button
                onClick={() => {
                    window.electron.git.account.open("https://github.com/login/oauth/authorize?client_id=Iv23li81DmrWmEfXtDcS&scope=user,repo", "_self");
                }}
            >
                ログイン
            </button>
        </div>
    );
};

export default Acount;