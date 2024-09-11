export default defineEventHandler(async(event) => {
    const config = useRuntimeConfig();

    const isDateValid = (dateStr) => {
        return !isNaN(new Date(dateStr));
    }

    let canAccess = true
    try {
        const res = await $fetch(`${config.public.PUBLIC_FE_BUCKET}frontend/maintenance.json`)
        if (res.status && res.range && res.date_from && res.date_to && isDateValid(res.date_from) && isDateValid(res.date_to)) {
            if (new Date() >= new Date(res.date_from) && new Date() <= new Date(res.date_to)) {
                canAccess = false
            }
        } else if (res.status && !res.range) {
            canAccess = false
        }

        // Add MERCHANT and build for maintenance; Remove MERCHANT and build for Normal flow
        if ([].includes(config.public.MERCHANT)) {
            canAccess = false
        }
    } catch (e) {}

    if ((!canAccess && config.public.ENV == 'production')) {
        return `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Maintenance</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            background: #FFF;
                            text-align: center;
                            color: #000;
                            font-family: 'Montserrat', sans-serif;
                            margin: 0;
                        }
                        .main-wrapper, .inner-wrapper {
                            /*background: #120E16;*/
                        }
                        .logo{
                            width: 100%;
                            max-width: 400px;
                            padding: 20px;
                            margin: 30px;
                        }

                        .top-section{
                            background-image: url('https://common-public.s3.ap-southeast-1.amazonaws.com/backend/10/maintenance_bg.png') !important;
                            background-size: cover;
                            background-repeat: no-repeat;
                        }
                        .top-content{
                            display: flex;
                            flex-direction: row;
                            align-items: center;
                            justify-content: center;
                            color: #FFF;
                        }
                        .top-title{
                            font-size: 2.5rem;
                            font-weight: 700;
                        }

                        .bottom-section{
                            max-width: 1200px;
                            margin: 20px auto;
                        }

                        .bottom-title{
                            color: #0043F8;
                            font-weight: 600;
                            font-size: 18px;
                        }

                        .bottom-contents{
                            padding: 10px;
                            max-width: 75%;
                            margin: 20px auto;
                            line-height: 2;
                        }

                        .text-blue{
                            color: #0043F8;
                            text-decoration: underline;
                            font-weight: 600;
                        }

                        .m-dev{
                            display: none;
                        }

                        .d-dev{
                            display: flex;
                        }

                        @media only screen and (max-width: 800px) {
                            .top-section{
                                background-image: url('https://common-public.s3.ap-southeast-1.amazonaws.com/backend/10/maintenance_bg_mob.png') !important;
                                background-size: cover;
                                background-repeat: no-repeat;
                                background-position: center;
                            }
                            .top-content{
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                color: #FFF;
                            }

                            .top-title {
                                font-size: 2rem;
                                font-weight: 700;
                            }

                            .logo {
                                width: 100%;
                                max-width: 300px;
                                padding: 20px;
                                margin: 0px 0px 20px 0px;
                            }

                            .bottom-title{
                                font-size: 15px;
                            }

                            .bottom-contents{
                                font-size: 14px;
                            }

                            .m-dev{
                                display: flex;
                                margin: 10% 5% 0;
                            }

                            .d-dev{
                                display: none;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="top-section text-center">
                        <div class="top-content">
                            <div class="top-title m-dev">System Under Maintenance</div>
                            <img class="logo" src="https://common-public.s3.ap-southeast-1.amazonaws.com/backend/10/maintenance.png" alt="Maintenance" />
                            <div class="top-title d-dev">System Under Maintenance</div>
                        </div>
                    </div>
                    
                    
                    <div class="bottom-section">
                        <div class="bottom-contents">
                            <div class="bottom-title">System Under Maintenance</div>
                            <div>System update in progress, please try again later. We apologize for any inconvenience that this may have caused. Should you have any inquiries, please contact our Customer Service Centre. <a href="javascript:void(0)" class="text-blue">Live Chat</a></div>
                        </div>

                        <div class="bottom-contents">
                            <div class="bottom-title">系统更新</div>
                            <div>系统更新中，请稍后再尝试。若有不便之处，尽请原谅。若您有任何疑问，请联系我们专业的在线客服。<a href="javascript:void(0)" class="text-blue">Live Chat</a></div>
                        </div>

                        <div class="bottom-contents">
                            <div class="bottom-title">Pemeliharaan Sistem</div>
                            <div>Member yang terhormat, kami informasikan bahwa pemeliharaan sistem sedang dalam proses, mohon mencoba lagi nanti. Mohon maaf atas ketidaknyamanan yang terjadi. Apabila anda membutuhkan bantuan, jangan ragu untuk menghubungi kami. <a href="javascript:void(0)" class="text-blue">Live Chat</a></div>
                        </div>

                        <div class="bottom-contents">
                            <div class="bottom-title">Bảo Trì Hệ Thống Hệ thống đang bảo trì</div>
                            <div>Quý khách vui lòng kiểm tra lại sau khi hệ thống bảo trì hoàn tất. Mọi thắc mắc vui lòng liên hệ chăm sóc khách hàng 24/7. <a href="javascript:void(0)" class="text-blue">Live Chat</a></div>
                        </div>

                        <div class="bottom-contents">
                            <div class="bottom-title">ระบบอยู่ระหว่างการบำรุงรักษา</div>
                            <div>กำลังอัปเดตระบบ โปรดลองอีกครั้งในภายหลัง เราขออภัยในความไม่สะดวกที่อาจเกิดขึ้น หากท่านมีข้อสงสัยประการใด โปรดติดต่อศูนย์บริการลูกค้าของเรา แชทสด. <a href="javascript:void(0)" class="text-blue">Live Chat</a></div>
                        </div>
                    </div>
                </body>
            </html>
        `
    }
})