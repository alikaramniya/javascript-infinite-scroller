<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\View\View;

class PostController extends Controller
{
    /**
     * Return list posts 
     *
     * @return \Illuminate\Http\Response
     */
    public function index(): View 
    {
        return view('post.list');
    }
    
    /**
     * Get list posts
     *
     * @return \Illuminate\Http\Response
     */
    public function getListPosts(Request $request)
    {
        usleep(rand(500000,1500000));
        $posts = $request->search
            ? Post::where('title', 'like', "%$request->search%")->paginate()
            : ['data' => []];

        if ($request->has('page')) {
            return response()->json(Post::paginate());
        }

        return response()->json($posts);
    }
}
