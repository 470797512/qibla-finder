class PrayerTimesCalculator {
    constructor() {
        // 麦加的坐标
        this.MECCA_LAT = 21.4225;
        this.MECCA_LNG = 39.8262;
        
        // 祷告时间名称
        this.prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
        
        this.init();
    }

    init() {
        this.timeDisplay = document.querySelector('.time-display');
        this.countdown = document.querySelector('.countdown');
        this.prayerList = document.querySelector('.prayer-list');
        
        // 每分钟更新一次显示
        setInterval(() => this.updateDisplay(), 60000);
    }

    calculatePrayerTimes(latitude, longitude, date = new Date()) {
        // 使用天文算法计算太阳位置
        const jDate = this.julianDate(date);
        const times = this.computePrayerTimes(jDate, latitude, longitude);
        
        return {
            fajr: this.adjustTime(times.fajr),
            dhuhr: this.adjustTime(times.dhuhr),
            asr: this.adjustTime(times.asr),
            maghrib: this.adjustTime(times.maghrib),
            isha: this.adjustTime(times.isha)
        };
    }

    julianDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        
        if (month <= 2) {
            year -= 1;
            month += 12;
        }
        
        const a = Math.floor(year / 100);
        const b = 2 - a + Math.floor(a / 4);
        
        return Math.floor(365.25 * (year + 4716)) 
             + Math.floor(30.6001 * (month + 1)) 
             + day + b - 1524.5;
    }

    computePrayerTimes(jd, latitude, longitude) {
        const times = {
            fajr: this.computeFajr(jd, latitude, longitude),
            dhuhr: this.computeDhuhr(jd, latitude, longitude),
            asr: this.computeAsr(jd, latitude, longitude),
            maghrib: this.computeMaghrib(jd, latitude, longitude),
            isha: this.computeIsha(jd, latitude, longitude)
        };
        
        return times;
    }

    // 计算麦加方向
    calculateQiblaDirection(latitude, longitude) {
        const φ1 = this.toRadians(latitude);
        const φ2 = this.toRadians(this.MECCA_LAT);
        const Δλ = this.toRadians(this.MECCA_LNG - longitude);
        
        const y = Math.sin(Δλ);
        const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
        
        let qibla = this.toDegrees(Math.atan2(y, x));
        if (qibla < 0) qibla += 360;
        
        return qibla;
    }

    // 辅助方法
    toRadians(degrees) {
        return degrees * Math.PI / 180;
    }

    toDegrees(radians) {
        return radians * 180 / Math.PI;
    }

    adjustTime(time) {
        const date = new Date();
        const [hours, minutes] = time.split(':').map(Number);
        date.setHours(hours, minutes, 0);
        return date;
    }

    updateDisplay() {
        const now = new Date();
        const times = this.calculatePrayerTimes(this.currentLat, this.currentLng);
        
        // 找到下一个祷告时间
        const nextPrayer = this.findNextPrayer(times);
        
        // 更新显示
        this.timeDisplay.textContent = this.formatTime(nextPrayer.time);
        this.countdown.textContent = this.getCountdown(nextPrayer.time);
        
        // 更新祷告时间列表
        this.updatePrayerList(times);
    }

    findNextPrayer(times) {
        const now = new Date();
        let nextPrayer = null;
        
        for (const [name, time] of Object.entries(times)) {
            if (time > now) {
                nextPrayer = { name, time };
                break;
            }
        }
        
        // 如果今天所有时间都过了，返回明天的第一个时间
        if (!nextPrayer) {
            const tomorrowTimes = this.calculatePrayerTimes(
                this.currentLat, 
                this.currentLng, 
                new Date(now.getTime() + 24 * 60 * 60 * 1000)
            );
            nextPrayer = {
                name: 'fajr',
                time: tomorrowTimes.fajr
            };
        }
        
        return nextPrayer;
    }

    formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    getCountdown(targetTime) {
        const now = new Date();
        const diff = targetTime - now;
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}小时${minutes}分钟`;
    }

    updatePrayerList(times) {
        this.prayerList.innerHTML = '';
        
        for (const name of this.prayerNames) {
            const item = document.createElement('div');
            item.className = 'prayer-item';
            item.innerHTML = `
                <span class="prayer-name">${Utils.translate(name)}</span>
                <span class="prayer-time">${this.formatTime(times[name])}</span>
            `;
            this.prayerList.appendChild(item);
        }
    }

    setLocation(latitude, longitude) {
        this.currentLat = latitude;
        this.currentLng = longitude;
        this.updateDisplay();
    }
} 