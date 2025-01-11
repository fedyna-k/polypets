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
            let homography = this.homography(mat);
            console.log(homography);
            return homography;
        }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch(e) {
            // console.error(e);
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

    detectCorners() {
        let [markers_position, ids] = this.analyseMat();

        let detected_corners = [0, 0, 0, 0];
        for (let i = 0; i < ids.size()["height"]; i++) {
            const cur_id = ids.data32S[i];
            if (cur_id < 4) {
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

        return detected_corners;
    }

    /**
     * Computes the homography matrix of an openCV image to get the plane of the board.
     * @param {cv.Mat} mat A cv.Mat image
     * @returns The homography matrix to get the plane of the board from the photo
     * @throws An error when the aruco markers of the corners are not detected
     */
    homography(detected_corners) {
        const src_points = this.cv.matFromArray(4, 2, this.cv.CV_64F, [5, 5, 284, 5, 284, 197, 5, 197]);
        
        // if (detected_corners.some(corner => typeof corner == "number")) {
        //     throw new Error("Corners not detected properly");
        // }
        
        const H = this.cv.findHomography(this.cv.matFromArray(4, 2, this.cv.CV_64F, detected_corners.flat()), src_points, this.cv.RANSAC, 3, new this.cv.Mat());
        return H.data64F;
    }


    setIntrinsicCameraMatrix(focal_length_35mm, width, height) {
        // Get FOV and convert to degrees
        const FOV = 2 * Math.atan(36/(2 * focal_length_35mm)) * 180 / Math.PI;

        // Get fx and fy
        const fx = Math.floor(width / (2 * Math.tan(FOV)));
        const fy = Math.floor(height / (2 * Math.tan(FOV)));

        // Get instrinsic camera matrix
        this.K = this.cv.matFromArray(3, 3, this.cv.CV_64F, [[fx, 0, Math.floor(width / 2)], [0, fy, Math.floor(height / 2)], [0, 0, 1]].flat());
    }

    isIntrinsicCameraSet() {
        return this.K != undefined;
    }

    getInstrinsicCamera() {
        return this.K.data64F;
    }

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
}