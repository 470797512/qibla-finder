class CompassController {
    constructor() {
        this.compass = document.querySelector('.compass');
        this.qiblaIndicator = document.querySelector('.qibla-indicator');
        this.accuracyIndicator = document.querySelector('.accuracy-indicator');
        this.isCalibrating = false;
        this.currentHeading = 0;
        this.qiblaAngle = 0;
        
        // 初始化精度指示器的文本
        const text = this.accuracyIndicator.querySelector('.accuracy-text');
        text.dataset.key = 'highAccuracy';  // 设置初始状态为高精度
        text.textContent = Utils.translate('highAccuracy');
        
        this.init();
        
        // 监听语言变化
        window.addEventListener('languagechange', () => {
            const text = this.accuracyIndicator.querySelector('.accuracy-text');
            if (text.dataset.key) {
                text.textContent = Utils.translate(text.dataset.key);
            }
        });
    }

    async init() {
        if ('DeviceOrientationEvent' in window) {
            try {
                // 对于 iOS 13+ 需要请求权限
                if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                    const permission = await DeviceOrientationEvent.requestPermission();
                    if (permission === 'granted') {
                        this.startCompass();
                    }
                } else {
                    this.startCompass();
                }
            } catch (error) {
                console.error('罗盘初始化失败:', error);
            }
        }

        this.generateDegreeMarks();
    }

    startCompass() {
        window.addEventListener('deviceorientation', (event) => {
            this.handleOrientation(event);
        }, true);
    }

    handleOrientation(event) {
        // 实现卡尔曼滤波
        const alpha = event.alpha || 0; // 设备朝向（以度为单位）
        this.currentHeading = this.kalmanFilter(alpha);
        
        // 更新罗盘显示
        this.updateCompassDisplay();
        
        // 更新精度指示器
        this.updateAccuracyIndicator(event);
    }

    kalmanFilter(measurement) {
        // 简化版卡尔曼滤波实现
        if (!this.kalmanState) {
            this.kalmanState = measurement;
            this.kalmanUncertainty = 1;
        }

        const kalmanGain = this.kalmanUncertainty / (this.kalmanUncertainty + 0.1);
        this.kalmanState = this.kalmanState + kalmanGain * (measurement - this.kalmanState);
        this.kalmanUncertainty = (1 - kalmanGain) * this.kalmanUncertainty;

        return this.kalmanState;
    }

    updateCompassDisplay() {
        // 更新罗盘旋转
        this.compass.style.transform = `rotate(${-this.currentHeading}deg)`;
        
        // 更新麦加方向指示器
        const qiblaRotation = this.qiblaAngle - this.currentHeading;
        this.qiblaIndicator.style.transform = `rotate(${qiblaRotation}deg)`;

        // 更新方向提示
        this.updateDirectionInfo(qiblaRotation);
    }

    updateDirectionInfo(qiblaRotation) {
        const directionLabel = document.querySelector('.qibla-direction .info-label');
        const directionValue = document.querySelector('.qibla-direction .direction-value');
        const distanceLabel = document.querySelector('.qibla-distance .info-label');
        const distanceValue = document.querySelector('.qibla-distance .distance-value');

        // 更新标签
        directionLabel.textContent = Utils.translate('qiblaDirection');
        distanceLabel.textContent = Utils.translate('distanceToMecca');

        // 格式化方向值
        let normalizedAngle = (qiblaRotation + 360) % 360;
        let direction = '';
        
        if (normalizedAngle > 337.5 || normalizedAngle <= 22.5) {
            direction = Utils.translate('north');
        } else if (normalizedAngle > 22.5 && normalizedAngle <= 67.5) {
            direction = `${Utils.translate('north')}${Utils.translate('east')}`;
        } else if (normalizedAngle > 67.5 && normalizedAngle <= 112.5) {
            direction = Utils.translate('east');
        } else if (normalizedAngle > 112.5 && normalizedAngle <= 157.5) {
            direction = `${Utils.translate('east')}${Utils.translate('south')}`;
        } else if (normalizedAngle > 157.5 && normalizedAngle <= 202.5) {
            direction = Utils.translate('south');
        } else if (normalizedAngle > 202.5 && normalizedAngle <= 247.5) {
            direction = `${Utils.translate('south')}${Utils.translate('west')}`;
        } else if (normalizedAngle > 247.5 && normalizedAngle <= 292.5) {
            direction = Utils.translate('west');
        } else if (normalizedAngle > 292.5 && normalizedAngle <= 337.5) {
            direction = `${Utils.translate('west')}${Utils.translate('north')}`;
        }

        directionValue.textContent = `${Math.round(normalizedAngle)}° ${direction}`;

        // 计算并显示距离
        if (this.currentLat && this.currentLng) {
            const distance = Utils.calculateDistance(
                this.currentLat,
                this.currentLng,
                this.MECCA_LAT,
                this.MECCA_LNG
            );
            distanceValue.textContent = `${Math.round(distance)} ${Utils.translate('kilometers')}`;
        }
    }

    updateAccuracyIndicator(event) {
        const accuracy = event.webkitCompassAccuracy || 0;
        const dot = this.accuracyIndicator.querySelector('.accuracy-dot');
        const text = this.accuracyIndicator.querySelector('.accuracy-text');

        if (accuracy < 15) {
            dot.style.backgroundColor = '#4CD964';
            text.dataset.key = 'highAccuracy';
            text.textContent = Utils.translate('highAccuracy');
        } else if (accuracy < 30) {
            dot.style.backgroundColor = '#FFCC00';
            text.dataset.key = 'mediumAccuracy';
            text.textContent = Utils.translate('mediumAccuracy');
        } else {
            dot.style.backgroundColor = '#FF3B30';
            text.dataset.key = 'lowAccuracy';
            text.textContent = Utils.translate('lowAccuracy');
        }
    }

    setQiblaAngle(angle) {
        this.qiblaAngle = angle;
        this.updateCompassDisplay();
    }

    setLocation(latitude, longitude) {
        this.currentLat = latitude;
        this.currentLng = longitude;
        this.updateDirectionInfo(this.qiblaAngle - this.currentHeading);
    }

    generateDegreeMarks() {
        const degreesGroup = document.querySelector('.degree-marks');
        degreesGroup.innerHTML = '';
        
        const CENTER = 200;  // SVG 中心点
        const OUTER_RADIUS = 195;  // 外圈半径
        const INNER_RADIUS = 185;  // 内圈半径
        const TEXT_RADIUS = 170;   // 文字半径
        
        // 生成主要刻度（每30度）
        for (let i = 0; i < 360; i += 30) {
            const angle = (i - 90) * Math.PI / 180; // 从正上方开始，逆时针旋转
            
            // 计算刻度线端点
            const x1 = CENTER + INNER_RADIUS * Math.cos(angle);
            const y1 = CENTER + INNER_RADIUS * Math.sin(angle);
            const x2 = CENTER + OUTER_RADIUS * Math.cos(angle);
            const y2 = CENTER + OUTER_RADIUS * Math.sin(angle);
            
            // 创建刻度线
            const mark = document.createElementNS("http://www.w3.org/2000/svg", "line");
            mark.setAttribute("x1", x1);
            mark.setAttribute("y1", y1);
            mark.setAttribute("x2", x2);
            mark.setAttribute("y2", y2);
            mark.setAttribute("class", "degree-mark");
            degreesGroup.appendChild(mark);
            
            // 只在主要方向添加文字
            if (i % 90 === 0) {
                const textX = CENTER + TEXT_RADIUS * Math.cos(angle);
                const textY = CENTER + TEXT_RADIUS * Math.sin(angle);
                
                const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.setAttribute("x", textX);
                text.setAttribute("y", textY);
                text.setAttribute("class", "degree-text");
                text.setAttribute("text-anchor", "middle");
                text.setAttribute("dominant-baseline", "middle");
                text.setAttribute("transform", `rotate(${i},${textX},${textY})`);
                
                // 设置方向文字
                let directionText = '';
                switch(i) {
                    case 0: directionText = 'N'; break;
                    case 90: directionText = 'E'; break;
                    case 180: directionText = 'S'; break;
                    case 270: directionText = 'W'; break;
                }
                text.textContent = directionText;
                degreesGroup.appendChild(text);
            }
        }
        
        // 生成次要刻度（每6度）
        for (let i = 0; i < 360; i += 6) {
            if (i % 30 !== 0) {
                const angle = (i - 90) * Math.PI / 180;
                
                const x1 = CENTER + (INNER_RADIUS + 5) * Math.cos(angle);
                const y1 = CENTER + (INNER_RADIUS + 5) * Math.sin(angle);
                const x2 = CENTER + OUTER_RADIUS * Math.cos(angle);
                const y2 = CENTER + OUTER_RADIUS * Math.sin(angle);
                
                const mark = document.createElementNS("http://www.w3.org/2000/svg", "line");
                mark.setAttribute("x1", x1);
                mark.setAttribute("y1", y1);
                mark.setAttribute("x2", x2);
                mark.setAttribute("y2", y2);
                mark.setAttribute("class", "degree-mark");
                degreesGroup.appendChild(mark);
            }
        }
    }
} 