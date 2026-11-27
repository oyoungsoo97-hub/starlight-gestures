# Starlight Gestures

[English](#english) · [Deutsch](#deutsch) · [한국어](#한국어)

![A tree of stars opens into a spiral galaxy, then gathers again.](./starlight-preview.gif)

## English

Bring your hands together in front of your webcam and the stars gather into a tree. Move your hands apart and the tree opens into a spiral galaxy. The upper panel shows your mirrored camera feed with the joints of your hands marked. The lower panel renders the scene in 3D with WebGL. Hand tracking runs in your browser.

### Run the app

You’ll need Python 3.7 or later and curl. Download the repository, open a terminal in the project folder, and run the following command.

```sh
python3 run.py
```

Open the app in your browser and allow camera access. The first run downloads about 26 MB of MediaPipe files, including the hand-tracking model. After that, the app works offline. If the port is already in use, run `python3 run.py --port 8000` and open the address printed in the terminal. [Open the local app](http://127.0.0.1:8642/)

### Gestures

| What you do | What happens |
| --- | --- |
| Move one hand sideways or up and down | The scene rotates in 3D. |
| Bring your hand closer to the camera | The scene zooms in. |
| Bring your hands together or move them apart | The stars gather into a tree or spread into a spiral galaxy. |
| Hold one hand higher than the other | The scene tilts to follow the angle between your hands. |
| Sweep your fingertips quickly through the air | Your fingertips leave a trail of light and send out sparks and ripples. |

You can also drag the lower panel or use the slider and the **트리** (tree) and **별하늘** (starry sky) buttons. To turn the camera off, click **카메라 끄기** in the upper right.

### Tools and inspiration

The app tracks hands with Google’s MediaPipe Hand Landmarker. [MediaPipe documentation](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js)

cupidbity’s *Spiderlily* inspired the gesture controls. A reel by lilian.chiuuu inspired the layout with the camera above the particle tree. [Spiderlily](https://github.com/cupidbity/spiderlily) · [Original reel](https://www.instagram.com/reel/Df83WTfBx9T/)

## Deutsch

Führe vor der Webcam die Hände zusammen, und die Sterne bilden einen Baum. Bewegst du die Hände auseinander, öffnet sich der Baum zu einer Spiralgalaxie. Oben siehst du dein gespiegeltes Kamerabild mit den markierten Handgelenken und Fingergelenken. Darunter erscheint die mit WebGL gezeichnete 3D-Szene. Die Handerkennung läuft in deinem Browser.

### Anwendung starten

Du brauchst Python ab Version 3.7 und curl. Lade das Repository herunter, öffne ein Terminal im Projektordner und führe diesen Befehl aus.

```sh
python3 run.py
```

Öffne die Anwendung im Browser und erlaube den Kamerazugriff. Beim ersten Start lädt sie rund 26 MB an MediaPipe-Dateien herunter, darunter das Modell für die Handerkennung. Danach funktioniert sie auch offline. Ist der Port bereits belegt, starte die Anwendung mit `python3 run.py --port 8000` und öffne die Adresse, die im Terminal erscheint. [Lokale Anwendung öffnen](http://127.0.0.1:8642/)

### Gesten

| Deine Bewegung | Wirkung |
| --- | --- |
| Bewege eine Hand seitlich oder auf und ab | Die Szene dreht sich im Raum. |
| Führe die Hand näher an die Kamera | Die Ansicht wird größer. |
| Führe beide Hände zusammen oder auseinander | Die Sterne bilden einen Baum oder breiten sich zu einer Spiralgalaxie aus. |
| Halte eine Hand höher als die andere | Die Szene neigt sich entsprechend dem Winkel zwischen deinen Händen. |
| Ziehe die Fingerspitzen schnell durch die Luft | Eine Lichtspur folgt deinen Fingern. Funken sprühen, und Wellen breiten sich aus. |

Du kannst die Szene auch durch Ziehen im unteren Bildbereich, mit dem Schieberegler oder mit den Schaltflächen **트리** (Baum) und **별하늘** (Sternenhimmel) steuern. Mit **카메라 끄기** oben rechts schaltest du die Kamera aus.

### Technik und Vorbilder

Für die Handerkennung nutzt die Anwendung den MediaPipe Hand Landmarker von Google. [MediaPipe-Dokumentation](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js)

Die Gestensteuerung ist von cupidbitys *Spiderlily* inspiriert. Die Idee für das Kamerabild über dem Baum aus Lichtpunkten stammt aus einem Reel von lilian.chiuuu. [Spiderlily](https://github.com/cupidbity/spiderlily) · [Original-Reel](https://www.instagram.com/reel/Df83WTfBx9T/)

## 한국어

웹캠 앞에서 양손을 모으면 빛나는 입자가 트리를 만들고, 벌리면 나선 은하로 펼쳐집니다. 화면 위쪽에는 거울처럼 좌우가 반전된 카메라 영상과 손 관절이 표시됩니다. 아래쪽의 3D 장면은 WebGL로 그리며, 손 추적은 브라우저 안에서 처리합니다.

### 실행하기

Python 3.7 이상과 curl이 필요합니다. 저장소를 내려받은 뒤 프로젝트 폴더에서 실행하세요.

```sh
python3 run.py
```

브라우저에서 [별빛 트리 열기](http://127.0.0.1:8642/)를 선택하고 카메라 사용을 허용하세요. 처음 실행할 때 약 26MB의 MediaPipe 실행 파일과 손 인식 모델을 다운로드합니다. 이후에는 저장된 파일을 사용하며 오프라인에서도 실행할 수 있습니다. 포트를 이미 사용 중이면 `python3 run.py --port 8000`으로 실행하고 터미널에 표시된 주소를 여세요.

### 조작법

| 동작 | 화면에서 일어나는 일 |
| --- | --- |
| 손을 좌우 또는 위아래로 움직이기 | 트리와 은하가 손의 위치를 따라 입체적으로 회전합니다. |
| 손을 카메라 가까이 가져가기 | 장면이 확대됩니다. |
| 양손을 모으거나 벌리기 | 입자가 트리로 모이거나 나선 은하로 퍼집니다. |
| 한쪽 손을 더 높이 들기 | 두 손의 기울기에 맞춰 장면이 기울어집니다. |
| 손끝을 빠르게 휘두르기 | 빛의 꼬리, 불꽃과 파문이 생깁니다. |

카메라 없이도 아래쪽 화면을 드래그하거나 슬라이더와 버튼으로 장면을 바꿀 수 있습니다. 카메라는 오른쪽 위 버튼으로 끌 수 있습니다.

### 사용한 도구와 참고 작품

손 인식에는 Google의 MediaPipe Hand Landmarker를 사용합니다. [MediaPipe 문서](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker/web_js)

손으로 작품을 움직이는 아이디어는 cupidbity의 Spiderlily에서, 카메라와 입자 트리를 위아래로 배치한 구도는 lilian.chiuuu의 릴스에서 영감을 받았습니다. [Spiderlily](https://github.com/cupidbity/spiderlily) · [참고 릴스](https://www.instagram.com/reel/Df83WTfBx9T/)
