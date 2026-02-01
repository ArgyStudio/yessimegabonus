const id = crypto.randomUUID();
console.log(id)

window.addEventListener('load', async () => {
    document.body.classList.remove("lbody")
    console.log("load")


    function parseCookies() {
        return document.cookie.split("; ").reduce((acc, kv) => {
            const [k, ...vals] = kv.split("=");
            acc[k] = vals.join("=");
            return acc;
        }, {});
    }

    function waitForCookie(name, timeout = 3000) {
        return new Promise((res) => {
            const start = Date.now();
            (function check() {
                if (
                    document.cookie
                        .split("; ")
                        .some((c) => c.startsWith(name + "=")) ||
                    Date.now() - start > timeout
                )
                    return res();
                requestAnimationFrame(check);
            })();
        });
    }

    await Promise.all([waitForCookie("_fbc"), waitForCookie("_fbp")]);
    const { _fbc: fbc = null, _fbp: fbp = null } = parseCookies();

    const fbclid = new URLSearchParams(window.location.search).get(
        "fbclid"
    );

    if (fbc && fbp) {
        //
        const payl = {
            fbc: fbc,
            fbp: fbp,
            fbclid: fbclid,
            pixelId: PIXEL_ID,
            uuid: id
        };

        const URL =
            "https://46oqqbz2k7.execute-api.us-east-2.amazonaws.com/default/visitasV4";
        try {
            const call = await fetch(URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payl),
            });

            console.log("POST -> visitasV4");


            if (!call.ok) {
                throw new Error(`HTTP error! status: ${call.status}`);
            }


            const resp = await call.json().catch(() => null);
            console.log("resp vV4 = ", resp)

            if (resp) {
                if (resp.auth == 1) {
                    document.cookie = `auth=${fbclid}; max-age=${365 * 24 * 60 * 60
                        }; path=/`;
                    // window.location.href = "/landing";
                } else if (resp.auth == 0) {
                    window.location.href = "/wonbet";
                }
            }
        } catch (error) {
            console.error("Error en la solicitud fetch:", error);
        }
    }




})





document.getElementById("Btn").addEventListener("click", async () => {


    document.getElementById("loading-overlay").classList.remove("hidden")
    // document.getElementById("cont").classList.add("hidden")
    const gc = document.cookie.split('; ').find(c => c.startsWith("auth" + '='));
    const fI = gc ? decodeURIComponent(gc.split('=')[1] || '') : false;


    async function post(url, payload) {

        console.log(`[post] URL : ${url}\nPAYLOAD : ${payload}`);
        const call = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return call
    }


    const url = "https://qvozlcpil1.execute-api.us-east-2.amazonaws.com/prod/F1-GANAMOS-ADS"


    const resp = await post(url)

    if (resp.ok) {
        console.log("ok")
        const data = await resp.json()
        console.log(data)
        const ph = data.ph
        const msg = `Hola Ganamos! vengo por el bono de bienvenida\nMi codigo promocional es: ${id}`
        const url = `https://wa.me/${ph}?text=${encodeURIComponent(msg)}`;
        window.location.href = url
    }




})
