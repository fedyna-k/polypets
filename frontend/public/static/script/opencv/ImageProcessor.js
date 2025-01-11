// ===========================================================================================
// CONSTANTS
// ===========================================================================================

/*
    Tiles are numbered from 0 to 15
    0-4 are Fruits
    5-9 are Pets
    10-13 are Pets in the Shop
    14-15 are Fruits in the Shop
*/

// Defines vertical zones (in mm) on the board
const v_zones = [
    [0, 73],    // Fruits
    [73, 133],  // Pets
    [133, 210]  // Shop
];

// Define horizontal zones (in mm) on the board
// Pets/Fruits zone
const h_fruits_pets = [
    [0, 44],
    [44, 84],
    [84, 124],
    [124, 164],
    [164, 206]
];
// Shop zone
const h_shop = [
    // Pet shop
    [10, 52],
    [52, 92],
    [92, 132],
    [132, 174],
    // Fruit shop
    [190, 235],
    [235, 277]
];




// ===========================================================================================
// IMAGE PROCESSING CLASS
// ===========================================================================================

/**
 * Class to process images with OpenCV
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class ImageProcessor {
    /**
     * 
     * @param {*} opencvObject The imported openCV object
     */
    constructor(opencvObject) {

        if (opencvObject == undefined) {
            return;
        }

        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    /**
     * Sets the openCV object locally in the class
     * @param {*} opencvObject 
     */
    setCV(opencvObject) {
        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    setMat(image) {
        this.mat = this.cv.matFromImageData(image);
    }

    /**
     * Processes an image to get the homography matrix to get the plane of the board.
     * If not all corners of the board are detected, prints an error and does not return anything.
     * @param {ImageData} image The image to process
     * @returns The homography matrix associated with the image
     */
    analyseImage(image){
        const mat = this.cv.matFromImageData(image);

        try {
            return this.homography(mat);
        }
        catch(e) {
            console.error(e);
        }
    }

    /**
     * Processes an openCV image to get the position of all aruco markers in it, as well as their ids
     * @param {cv.Mat} mat A cv.Mat image
     * @returns [markers_position, ids] : The position of all aruco markers in the image with their associated id
     */
    analyseMat() {
        let gray = new this.cv.Mat();
        this.cv.cvtColor(this.mat, gray, this.cv.COLOR_RGB2GRAY);
        this.mat.delete();
        
        let markers_position = new this.cv.MatVector();
        let ids = new this.cv.Mat();
        let rejected = new this.cv.MatVector();

        // Detection
        this.detector.detectMarkers(gray, markers_position, ids, rejected);
        
        
        // Free memory
        gray.delete();
        rejected.delete();

        return [markers_position, ids];
    }

    /**
     * Search for the corners of the board (aruco markers 0 to 3) in the image
     * @returns Array with the position (in pixels) of the detected corners
     */
    detectCorners() {
        this.markers = this.analyseMat();
        let [markers_position, ids] = this.markers;

        let detected_corners = [0, 0, 0, 0];
        for (let i = 0; i < ids.size()["height"]; i++) {
            const cur_id = ids.data32S[i];
            if (cur_id < 4) {
                // Take top left corner of aruco marker
                detected_corners[cur_id] = [markers_position.get(i).data32F[0], markers_position.get(i).data32F[1]];
            }

            
            // TESTS SEULEMENT : LES COINS EN BAS SONT INVERSÉS SUITE À UNE ERREUR D'IMPRESSION
            // let tmp = detected_corners[3];
            // detected_corners[3] = detected_corners[2];
            // detected_corners[2] = tmp;
            // --------------------------------------------------------------------------------
        }

        if (detected_corners.some(corner => typeof corner == "number")) {
            throw new Error("Corners not detected properly");
        }

        this.detected_corners = detected_corners;

        return detected_corners;
    }

    /**
     * Computes the homography matrix of an openCV image to get the plane of the board.
     * @param {cv.Mat} mat A cv.Mat image
     * @returns The homography matrix to get the plane of the board from the photo
     * @throws An error when the aruco markers of the corners are not detected
     */
    homography(detected_corners) {
        const src_points = this.cv.matFromArray(4, 2, this.cv.CV_64F, [0, 0, 265, 0, 265, 210, 0, 210]);
        
        const H = this.cv.findHomography(this.cv.matFromArray(4, 2, this.cv.CV_64F, detected_corners.flat()), src_points, this.cv.RANSAC, 3, new this.cv.Mat());
        this.homography_matrix = H.data64F;
    }


    /**
     * Sets the instrinsic camera matrix as a local attribute. This matrix is needed to project 3D models on the image
     * @param {*} focal_length_35mm The 35mm equivalent focal length of the used camera
     * @param {*} width The width of the image taken with the focal length passed
     * @param {*} height The height of the image taken with the focal length passed
     */
    setIntrinsicCameraMatrix(focal_length_35mm, width, height) {
        // Get FOV and convert to degrees
        const FOV = 2 * Math.atan(36/(2 * focal_length_35mm)) * 180 / Math.PI;

        // Get fx and fy
        const fx = Math.floor(width / (2 * Math.tan(FOV)));
        const fy = Math.floor(height / (2 * Math.tan(FOV)));

        // Get instrinsic camera matrix
        this.K = this.cv.matFromArray(3, 3, this.cv.CV_64F, [[fx, 0, Math.floor(width / 2)], [0, fy, Math.floor(height / 2)], [0, 0, 1]].flat());
    }

    /**
     * Detects if the intrinsic camera matrix as been set or not
     */
    isIntrinsicCameraSet() {
        return this.K != undefined;
    }


    /**
     * Compute and returns the rotation matrix and translation vector to get the camera pose in our scene from the picture
     * of the board.
     * @param {number[][]} corners Array with the position of the corners of the board (aruco markers 0 to 3) in pixels
     * @returns Array with in first position the rotation matrix and in the second position the translation vector : [rotation_array, translation_array]
     */
    getRotationAndTranslationMatrices(corners){
        const corners_mat = this.cv.matFromArray(4, 2, this.cv.CV_64F, corners.flat());
        const real_corners = this.cv.matFromArray(4, 3, this.cv.CV_64F, [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]].flat());

        let rvec = new this.cv.Mat();
        let tvec = new this.cv.Mat();
        const dist = new this.cv.Mat();

        // SolvePnP to get the rotation and translation vectors
        try {
            this.cv.solvePnP(real_corners, corners_mat, this.K, dist, rvec, tvec);
        } catch(error) {
            console.error("Error in SolvePnp :", error);
        }

        // Rodrigues to get rotation MATRIX from rotation VECTOR
        let rotation_mat = new this.cv.Mat();
        this.cv.Rodrigues(rvec, rotation_mat);

        // Convert from Mat to JSarray
        let rotation_array = [];
        let rotation_data = rotation_mat.data64F;
        for (let i = 0; i < 9; i += 3) {
            rotation_array.push(rotation_data[i], rotation_data[i+1], rotation_data[i+2]);
        }
        let translation_array = tvec.data64F;

        return [rotation_array, translation_array];
    }

    /**
     * Get the tile number of an object (an aruco marker for example) from its position in mm on the board
     * @param {number} position Position (in mm) of the object from the top left corner of the board [x, y]
     * @returns Tile number (between 0 and 15, see comments at the top of this file)
     */
    getTileNumber(position) {
        // Get warped position
        let x = position[0];
        let y = position[1];

        // Vertical zone
        let vertical;
        let i = 0;
        while (i < v_zones.length) {
            if (v_zones[i][0] <= y && y < v_zones[i][1]){
                vertical = i;
                break;
            }
            i++;
        }

        // Horizontal tile
        let horizontal;
        i = 0;
        if (vertical != 2) {
            while (i < h_fruits_pets.length) {
                if (h_fruits_pets[i][0] <= x && x < h_fruits_pets[i][1]) {
                    horizontal = i;
                    break;
                }
                i++;
            }
        }
        else {
            while (i < h_shop.length) {
                if (h_shop[i][0] <= x && x < h_shop[i][1]) {
                    horizontal = i;
                    break;
                }
                i++;
            }
        }

        return vertical * 5 + horizontal;
    }

    getmmPosFromPixelPos(pixel_pos) {
        let vect = [pixel_pos[0], pixel_pos[1], 1];
        let mm_pos = [0, 0, 0];

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                mm_pos[i] += this.homography_matrix[i * 3 + j] * vect[j];
            }
        }

        return [mm_pos[0] / mm_pos[2], mm_pos[1] / mm_pos[2]];
    }

    /**
     * Detects the cards that are in the tiles of the board
     * @returns A JSON with the correspondance : filed tile - ID of the card in that tile
     */
    detectCards() {
        let [markers_position, ids] = this.markers;

        let cards = {};
        for (let i = 0; i < ids.size()["height"]; i++) {
            const cur_id = ids.data32S[i];
            if (cur_id >= 4) {
                // Get position as mm
                let card_pix = [markers_position.get(i).data32F[0], markers_position.get(i).data32F[1]];

                let card_mm = this.getmmPosFromPixelPos(card_pix);
                for (let i of card_mm) {
                    if (i < 0) {throw new Error("Wrong dimension in mm");}
                }

                // Get card tile
                cards[this.getTileNumber(card_mm)] = cur_id;
            }
        }

        return cards;
    }
}