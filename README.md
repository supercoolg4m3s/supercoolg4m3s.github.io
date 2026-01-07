<!DOCTYPE html>
<html>
<head>
    <style>
        .top-bar {
            width: 100%;
            height: 120px;                 /* taller so the text has room */
            background-color: #333;        /* dark background */
            display: flex;                 /* enables centering */
            justify-content: center;       /* center horizontally */
            align-items: center;           /* center vertically */
        }

        .top-bar-text {
            color: white;                  /* white text */
            font-size: 36px;               /* big text */
            font-family: Arial, sans-serif;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="top-bar">
        <div class="top-bar-text">welcome to super cool g4m3s</div>
    </div>

</body>
</html>
<html>
<head>
    <style>
        .image-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* 3x3 grid */
            gap: 15px;
            width: 80%;
            margin: 40px auto;
        }

        .image-container {
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
            cursor: pointer;
        }

        .image-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0); /* invisible by default */
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            opacity: 0;
            transition: opacity 0.3s ease, background-color 0.3s ease;
        }

        .image-container:hover .overlay {
            opacity: 1;
            background-color: rgba(0, 0, 0, 0.5); /* 50% black */
        }
    </style>
</head>
<body>

<div class="image-grid">

    <!-- IMAGE 1 -->
    <a href="ragdoll-hit.html">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Ragdoll Hit</div>
        </div>
    </a>

    <!-- IMAGE 2 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 2</div>
        </div>
    </a>

    <!-- IMAGE 3 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 3</div>
        </div>
    </a>

    <!-- IMAGE 4 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 4</div>
        </div>
    </a>

    <!-- IMAGE 5 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 5</div>
        </div>
    </a>

    <!-- IMAGE 6 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 6</div>
        </div>
    </a>

    <!-- IMAGE 7 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 7</div>
        </div>
    </a>

    <!-- IMAGE 8 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 8</div>
        </div>
    </a>

    <!-- IMAGE 9 -->
    <a href="https://example.com">
        <div class="image-container">
            <img src="https://via.placeholder.com/300" alt="">
            <div class="overlay">Game 9</div>
        </div>
    </a>

</div>

</body>
</html>
<!DOCTYPE html>
