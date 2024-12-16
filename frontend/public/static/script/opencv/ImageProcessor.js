class ImageProcessor {

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

    setCV(opencvObject) {
        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    analyseImage(image){
        const mat = this.cv.matFromImageData(image);
        // return this.analyseMat(mat);

        try {
            this.homography(mat);
        }
        catch(e) {
            console.log(e);
        }
    }

    matToArrayInt(mat) {
        let result = [];
        for (let i = 0; i < mat.size(); i++) {
            let marker = mat.get(i); // Get marker position
            let points = [];
            for (let j = 0; j < marker.rows; j++) {
                points.push([marker.data32F[j * 2], marker.data32F[j * 2 + 1]]); // Get data as int
                console.log(j, marker.rows);
            }
            result.push(points);
            marker.delete();
        }

        return result;
    }

    analyseMat(mat) {
        let gray = new this.cv.Mat();
        this.cv.cvtColor(mat, gray, this.cv.COLOR_RGB2GRAY);
        mat.delete();
        
        let markers_position = new this.cv.MatVector();
        let ids = new this.cv.Mat();
        let rejected = new this.cv.MatVector();

        // Detection
        this.detector.detectMarkers(gray, markers_position, ids, rejected);
        
        
        // Free memory
        gray.delete();
        // ids.delete();
        // markers_position.delete();
        rejected.delete();

        return [markers_position, ids];
    }


    homography(mat) {
        let [markers_position, ids] = this.analyseMat(mat);

        let detected_corners = [0, 0, 0, 0];
        for (let i = 0; i < ids.size()["height"]; i++) {
            const cur_id = ids.data32S[i];
            if (cur_id < 4) {
                detected_corners[cur_id] = [markers_position.get(i).data32F[0], markers_position.get(i).data32F[1]];
                console.log("Corner detected : ", cur_id, "Corner :", detected_corners[cur_id]);
            }

            
            // TESTS SEULEMENT : LES COINS EN BAS SONT INVERSÉS SUITE À UNE ERREUR D'IMPRESSION
            let tmp = detected_corners[3];
            detected_corners[3] = detected_corners[2];
            detected_corners[2] = tmp;
            // --------------------------------------------------------------------------------
        }

        const src_points = this.cv.matFromArray(4, 2, this.cv.CV_32F, [[5, 5], [284, 5], [284, 197], [5, 197]]);
        
        if (detected_corners.some(corner => typeof corner == "number")) {
            throw new Error("Corners not detected properly");
        }
        
        const H = this.cv.findHomography(this.cv.matFromArray(4, 2, this.cv.CV_32F, detected_corners), src_points, this.cv.RANSAC);
        console.log(H);
        console.log(this.matToArrayInt(H));
    }
}